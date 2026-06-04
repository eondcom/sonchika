<script>
  import { createEventDispatcher } from 'svelte';
  import { formatDate } from '../lib/dataStore.js';
  
  export let treatments = [];
  export let children = [];
  
  const dispatch = createEventDispatcher();
  
  let showAddForm = false;
  let selectedChild = '';
  let newTreatment = {
    childId: '',
    date: '',
    type: '',
    description: '',
    diagnosis: [],
    cost: 0,
    notes: ''
  };
  
  function addTreatment() {
    const treatment = {
      id: `tr${Date.now()}`,
      ...newTreatment,
      diagnosis: newTreatment.diagnosis.filter(d => d.trim())
    };
    treatments = [...treatments, treatment];
    dispatch('update');
    showAddForm = false;
    resetForm();
  }
  
  function deleteTreatment(id) {
    if (confirm('이 치료기록을 삭제하시겠습니까?')) {
      treatments = treatments.filter(tr => tr.id !== id);
      dispatch('update');
    }
  }
  
  function resetForm() {
    newTreatment = {
      childId: '',
      date: '',
      type: '',
      description: '',
      diagnosis: [],
      cost: 0,
      notes: ''
    };
  }
  
  function addDiagnosisField() {
    newTreatment.diagnosis = [...newTreatment.diagnosis, ''];
  }
  
  function removeDiagnosisField(index) {
    newTreatment.diagnosis = newTreatment.diagnosis.filter((_, i) => i !== index);
  }
  
  $: filteredTreatments = selectedChild
    ? treatments.filter(tr => tr.childId === selectedChild)
    : treatments;
  
  $: sortedTreatments = [...filteredTreatments].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
</script>

<div class="history-container">
  <div class="header">
    <h2>📋 치료 기록</h2>
    <button class="add-btn" on:click={() => showAddForm = !showAddForm}>
      {showAddForm ? '취소' : '+ 기록 추가'}
    </button>
  </div>
  
  <div class="filter-section">
    <label>아이 필터:</label>
    <select bind:value={selectedChild}>
      <option value="">전체</option>
      {#each children as child}
        <option value={child.id}>{child.name}</option>
      {/each}
    </select>
  </div>
  
  {#if showAddForm}
    <form class="add-form" on:submit|preventDefault={addTreatment}>
      <div class="form-group">
        <label>아이 선택 *</label>
        <select bind:value={newTreatment.childId} required>
          <option value="">선택하세요</option>
          {#each children as child}
            <option value={child.id}>{child.name}</option>
          {/each}
        </select>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>날짜 *</label>
          <input type="date" bind:value={newTreatment.date} required />
        </div>
        
        <div class="form-group">
          <label>유형 *</label>
          <select bind:value={newTreatment.type} required>
            <option value="">선택하세요</option>
            <option value="검진">검진</option>
            <option value="충치치료">충치치료</option>
            <option value="불소도포">불소도포</option>
            <option value="실란트">실란트</option>
            <option value="스케일링">스케일링</option>
            <option value="파노라마">파노라마</option>
            <option value="기타">기타</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label>치료 내용 *</label>
        <input type="text" bind:value={newTreatment.description} placeholder="예: 1차 충치 치료 - 웃음가스 + 마취" required />
      </div>
      
      <div class="form-group">
        <label>진단 내용</label>
        {#each newTreatment.diagnosis as diag, i}
          <div class="diagnosis-row">
            <input type="text" bind:value={newTreatment.diagnosis[i]} placeholder="진단 내용을 입력하세요" />
            <button type="button" class="remove-btn" on:click={() => removeDiagnosisField(i)}>
              ✕
            </button>
          </div>
        {/each}
        <button type="button" class="add-diag-btn" on:click={addDiagnosisField}>
          + 진단 추가
        </button>
      </div>
      
      <div class="form-group">
        <label>비용 (원)</label>
        <input type="number" bind:value={newTreatment.cost} min="0" step="1000" />
      </div>
      
      <div class="form-group">
        <label>메모</label>
        <textarea bind:value={newTreatment.notes} placeholder="추가 메모사항"></textarea>
      </div>
      
      <button type="submit" class="submit-btn">저장</button>
    </form>
  {/if}
  
  <div class="treatments-list">
    {#if sortedTreatments.length === 0}
      <p class="empty-message">치료 기록이 없습니다.</p>
    {:else}
      {#each sortedTreatments as treatment}
        <div class="treatment-card">
          <div class="card-header">
            <div>
              <span class="child-badge">
                {children.find(c => c.id === treatment.childId)?.name}
              </span>
              <span class="type-badge">{treatment.type}</span>
              <span class="date">{formatDate(treatment.date)}</span>
            </div>
            <button class="delete-btn-small" on:click={() => deleteTreatment(treatment.id)}>
              🗑️
            </button>
          </div>
          
          <div class="card-body">
            <h4>{treatment.description}</h4>
            
            {#if treatment.diagnosis && treatment.diagnosis.length > 0}
              <div class="diagnosis-section">
                <strong>진단:</strong>
                <ul>
                  {#each treatment.diagnosis as diag}
                    <li>{diag}</li>
                  {/each}
                </ul>
              </div>
            {/if}
            
            {#if treatment.notes}
              <div class="notes-section">
                <strong>메모:</strong>
                <p>{treatment.notes}</p>
              </div>
            {/if}
            
            {#if treatment.cost > 0}
              <div class="cost-section">
                <strong>비용:</strong>
                <span class="cost-amount">{treatment.cost.toLocaleString()}원</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .history-container {
    max-width: 900px;
    margin: 0 auto;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  h2 {
    margin: 0;
    color: #667eea;
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
  
  .filter-section {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9ff;
    border-radius: 10px;
  }
  
  .filter-section label {
    font-weight: bold;
    color: #333;
  }
  
  .filter-section select {
    padding: 8px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1em;
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
  
  .diagnosis-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .diagnosis-row input {
    flex: 1;
  }
  
  .remove-btn {
    padding: 8px 12px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .add-diag-btn {
    padding: 8px 15px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9em;
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
  
  .empty-message {
    text-align: center;
    color: #999;
    padding: 40px;
    background: #f8f9ff;
    border-radius: 10px;
  }
  
  .treatments-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .treatment-card {
    background: white;
    border: 2px solid #e0e0e0;
    border-left: 4px solid #667eea;
    border-radius: 12px;
    overflow: hidden;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #f8f9ff;
    gap: 10px;
  }
  
  .card-header > div {
    display: flex;
    gap: 10px;
    align-items: center;
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
  
  .date {
    color: #666;
    font-size: 0.95em;
  }
  
  .delete-btn-small {
    background: none;
    border: none;
    font-size: 1.2em;
    cursor: pointer;
    padding: 5px;
    opacity: 0.6;
    transition: opacity 0.3s;
  }
  
  .delete-btn-small:hover {
    opacity: 1;
  }
  
  .card-body {
    padding: 20px;
  }
  
  h4 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.1em;
  }
  
  .diagnosis-section, .notes-section, .cost-section {
    margin-top: 15px;
  }
  
  .diagnosis-section ul {
    margin: 8px 0 0 20px;
    padding: 0;
  }
  
  .diagnosis-section li {
    margin-bottom: 5px;
    color: #555;
  }
  
  .notes-section p {
    margin: 8px 0 0 0;
    color: #555;
    padding: 10px;
    background: #f8f9ff;
    border-radius: 8px;
  }
  
  .cost-section {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .cost-amount {
    color: #667eea;
    font-size: 1.2em;
    font-weight: bold;
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
    
    .card-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
