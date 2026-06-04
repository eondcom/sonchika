<script>
  import { createEventDispatcher } from 'svelte';
  import { formatDate, formatTime } from '../lib/dataStore.js';
  
  export let appointments = [];
  export let children = [];
  
  const dispatch = createEventDispatcher();
  
  let showAddForm = false;
  let newAppointment = {
    childId: '',
    date: '',
    time: '',
    type: '',
    description: '',
    location: ''
  };
  
  function addAppointment() {
    const apt = {
      id: `apt${Date.now()}`,
      ...newAppointment,
      status: 'scheduled'
    };
    appointments = [...appointments, apt];
    dispatch('update');
    showAddForm = false;
    resetForm();
  }
  
  function deleteAppointment(id) {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      appointments = appointments.filter(apt => apt.id !== id);
      dispatch('update');
    }
  }
  
  function completeAppointment(id) {
    appointments = appointments.map(apt => 
      apt.id === id ? { ...apt, status: 'completed' } : apt
    );
    dispatch('update');
  }
  
  function resetForm() {
    newAppointment = {
      childId: '',
      date: '',
      time: '',
      type: '',
      description: '',
      location: ''
    };
  }
  
  $: sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateB - dateA;
  });
  
  $: scheduledAppointments = sortedAppointments.filter(apt => apt.status === 'scheduled');
  $: completedAppointments = sortedAppointments.filter(apt => apt.status === 'completed');
</script>

<div class="calendar-container">
  <div class="header">
    <h2>🗓️ 치과 일정</h2>
    <button class="add-btn" on:click={() => showAddForm = !showAddForm}>
      {showAddForm ? '취소' : '+ 일정 추가'}
    </button>
  </div>
  
  {#if showAddForm}
    <form class="add-form" on:submit|preventDefault={addAppointment}>
      <div class="form-group">
        <label>아이 선택</label>
        <select bind:value={newAppointment.childId} required>
          <option value="">선택하세요</option>
          {#each children as child}
            <option value={child.id}>{child.name}</option>
          {/each}
        </select>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>날짜</label>
          <input type="date" bind:value={newAppointment.date} required />
        </div>
        
        <div class="form-group">
          <label>시간</label>
          <input type="time" bind:value={newAppointment.time} required />
        </div>
      </div>
      
      <div class="form-group">
        <label>유형</label>
        <select bind:value={newAppointment.type} required>
          <option value="">선택하세요</option>
          <option value="검진">검진</option>
          <option value="충치치료">충치치료</option>
          <option value="불소도포">불소도포</option>
          <option value="실란트">실란트</option>
          <option value="스케일링">스케일링</option>
          <option value="교정상담">교정상담</option>
          <option value="기타">기타</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>병원명</label>
        <input type="text" bind:value={newAppointment.location} placeholder="OO치과" />
      </div>
      
      <div class="form-group">
        <label>메모</label>
        <textarea bind:value={newAppointment.description} placeholder="특이사항을 입력하세요"></textarea>
      </div>
      
      <button type="submit" class="submit-btn">저장</button>
    </form>
  {/if}
  
  <div class="appointments-section">
    <h3>예정된 일정 ({scheduledAppointments.length})</h3>
    {#if scheduledAppointments.length === 0}
      <p class="empty-message">예정된 일정이 없습니다.</p>
    {:else}
      <div class="appointments-list">
        {#each scheduledAppointments as apt}
          <div class="appointment-item scheduled">
            <div class="apt-header">
              <span class="child-badge">
                {children.find(c => c.id === apt.childId)?.name}
              </span>
              <span class="type-badge">{apt.type}</span>
            </div>
            <div class="apt-datetime">
              📅 {formatDate(apt.date)} {formatTime(apt.time)}
            </div>
            {#if apt.location}
              <div class="apt-location">🏥 {apt.location}</div>
            {/if}
            {#if apt.description}
              <div class="apt-description">{apt.description}</div>
            {/if}
            <div class="apt-actions">
              <button class="complete-btn" on:click={() => completeAppointment(apt.id)}>
                완료
              </button>
              <button class="delete-btn" on:click={() => deleteAppointment(apt.id)}>
                삭제
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <div class="appointments-section">
    <h3>완료된 일정 ({completedAppointments.length})</h3>
    {#if completedAppointments.length === 0}
      <p class="empty-message">완료된 일정이 없습니다.</p>
    {:else}
      <div class="appointments-list">
        {#each completedAppointments as apt}
          <div class="appointment-item completed">
            <div class="apt-header">
              <span class="child-badge">
                {children.find(c => c.id === apt.childId)?.name}
              </span>
              <span class="type-badge">{apt.type}</span>
              <span class="status-badge">✓ 완료</span>
            </div>
            <div class="apt-datetime">
              {formatDate(apt.date)} {formatTime(apt.time)}
            </div>
            {#if apt.location}
              <div class="apt-location">🏥 {apt.location}</div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .calendar-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  h2 {
    margin: 0;
    color: #667eea;
  }
  
  h3 {
    color: #333;
    margin: 30px 0 15px 0;
  }
  
  .add-btn {
    padding: 10px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .add-btn:hover {
    background: #5568d3;
  }
  
  .add-form {
    background: #f8f9ff;
    padding: 25px;
    border-radius: 15px;
    margin-bottom: 30px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: bold;
    font-size: 0.9em;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1em;
    box-sizing: border-box;
  }
  
  textarea {
    min-height: 80px;
    resize: vertical;
  }
  
  .submit-btn {
    width: 100%;
    padding: 12px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1em;
    font-weight: bold;
    cursor: pointer;
  }
  
  .submit-btn:hover {
    background: #5568d3;
  }
  
  .empty-message {
    text-align: center;
    color: #999;
    padding: 40px;
    background: #f8f9ff;
    border-radius: 10px;
  }
  
  .appointments-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .appointment-item {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
  }
  
  .appointment-item:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .appointment-item.scheduled {
    border-left: 4px solid #667eea;
  }
  
  .appointment-item.completed {
    opacity: 0.7;
    border-left: 4px solid #28a745;
  }
  
  .apt-header {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }
  
  .child-badge {
    background: #667eea;
    color: white;
    padding: 5px 12px;
    border-radius: 15px;
    font-size: 0.9em;
    font-weight: bold;
  }
  
  .type-badge {
    background: #f0f0f0;
    color: #333;
    padding: 5px 12px;
    border-radius: 15px;
    font-size: 0.9em;
  }
  
  .status-badge {
    background: #28a745;
    color: white;
    padding: 5px 12px;
    border-radius: 15px;
    font-size: 0.9em;
  }
  
  .apt-datetime {
    font-size: 1.1em;
    color: #333;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .apt-location {
    color: #666;
    margin-bottom: 8px;
  }
  
  .apt-description {
    color: #666;
    margin-top: 10px;
    padding: 10px;
    background: #f8f9ff;
    border-radius: 8px;
    font-size: 0.95em;
  }
  
  .apt-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }
  
  .complete-btn, .delete-btn {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .complete-btn {
    background: #28a745;
    color: white;
  }
  
  .complete-btn:hover {
    background: #218838;
  }
  
  .delete-btn {
    background: #dc3545;
    color: white;
  }
  
  .delete-btn:hover {
    background: #c82333;
  }
  
  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }
    
    .header {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
    }
    
    .add-btn {
      width: 100%;
    }
  }
</style>
