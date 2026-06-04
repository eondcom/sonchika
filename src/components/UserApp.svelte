<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { database, getUserData, initDatabase, saveDailyCheck, addChild, updateChild, deleteChild } from '../lib/dataStore.js';
  import { logout } from '../lib/auth.js';
  import ChildProfile from './ChildProfile.svelte';
  import Calendar from './Calendar.svelte';
  import TreatmentHistory from './TreatmentHistory.svelte';
  import DailyCheckList from './DailyCheckList.svelte';
  import CostStats from './CostStats.svelte';
  import Timeline from './Timeline.svelte';
  import BrushingTimer from './BrushingTimer.svelte';

  export let user;

  const dispatch = createEventDispatcher();

  let data = {};
  let currentView = 'dashboard';
  let selectedChild = null;
  let showMobileMenu = false;
  let showUserMenu = false;

  // 자녀 추가/수정 모달
  let showChildModal = false;
  let editingChild = null;
  let childForm = {
    name: '',
    birthDate: '',
    gender: 'male',
    note: ''
  };

  const genderOptions = [
    { value: 'male', label: '남자', emoji: '👦' },
    { value: 'female', label: '여자', emoji: '👧' }
  ];

  const menuItems = [
    { id: 'dashboard', label: '홈', icon: '🏠' },
    { id: 'brushing', label: '치카치카', icon: '🪥' },
    { id: 'calendar', label: '일정', icon: '📅' },
    { id: 'history', label: '치료기록', icon: '📋' },
    { id: 'daily', label: '일일체크', icon: '✅' },
    { id: 'stats', label: '비용', icon: '💰' },
    { id: 'timeline', label: '성장', icon: '📈' },
  ];

  onMount(() => {
    initDatabase();
    loadUserData();
  });

  $: if ($database && user) {
    loadUserData();
  }

  function loadUserData() {
    if (user) {
      data = getUserData(user.id) || {
        children: [],
        appointments: [],
        treatments: [],
        dailyChecks: [],
        costs: [],
        milestones: []
      };
    }
  }

  function updateData() {
    // 데이터 업데이트 후 다시 로드
    loadUserData();
  }

  function selectChild(childId) {
    selectedChild = childId;
    currentView = 'profile';
  }

  function getUpcomingAppointments() {
    return (data.appointments || [])
      .filter(apt => apt.status === 'scheduled')
      .slice(0, 3);
  }

  function getChildName(childId) {
    return data.children?.find(c => c.id === childId)?.name || '';
  }

  function getDaysUntil(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return '오늘';
    if (diff === 1) return '내일';
    if (diff < 0) return '지남';
    return `D-${diff}`;
  }

  function handleLogout() {
    logout();
    dispatch('logout');
  }

  // 자녀 관리 함수들
  function openAddChildModal() {
    editingChild = null;
    childForm = {
      name: '',
      birthDate: '',
      gender: 'male',
      note: ''
    };
    showChildModal = true;
  }

  function openEditChildModal(child) {
    editingChild = child;
    childForm = {
      name: child.name,
      birthDate: child.birthDate,
      gender: child.gender || 'male',
      note: child.note || ''
    };
    showChildModal = true;
  }

  function closeChildModal() {
    showChildModal = false;
    editingChild = null;
  }

  function handleSaveChild() {
    if (!childForm.name || !childForm.birthDate) {
      alert('이름과 생년월일을 입력해주세요.');
      return;
    }

    if (editingChild) {
      // 수정
      updateChild(editingChild.id, {
        name: childForm.name,
        birthDate: childForm.birthDate,
        gender: childForm.gender,
        note: childForm.note
      });
    } else {
      // 추가
      addChild(user.id, {
        name: childForm.name,
        birthDate: childForm.birthDate,
        gender: childForm.gender,
        note: childForm.note
      });
    }

    closeChildModal();
    loadUserData();
  }

  function handleDeleteChild(childId) {
    if (confirm('정말 삭제하시겠습니까? 관련된 모든 데이터가 삭제됩니다.')) {
      deleteChild(childId);
      loadUserData();
    }
  }
</script>

<div class="app-container">
  <!-- Sidebar Navigation -->
  <aside class="sidebar" class:open={showMobileMenu}>
    <div class="sidebar-header">
      <div class="logo">
        <span class="logo-icon">🦷</span>
        <div class="logo-text">
          <span class="logo-title">손치카</span>
          <span class="logo-subtitle">Sonchika</span>
        </div>
      </div>
    </div>

    <nav class="nav-menu">
      {#each menuItems as item}
        <button
          class="nav-item"
          class:active={currentView === item.id}
          on:click={() => { currentView = item.id; showMobileMenu = false; }}
        >
          <span class="nav-icon">{item.icon}</span>
          <span class="nav-label">{item.label}</span>
          {#if currentView === item.id}
            <span class="nav-indicator"></span>
          {/if}
        </button>
      {/each}
    </nav>

    <div class="sidebar-footer">
      <div class="user-section">
        <button class="user-btn" on:click={() => showUserMenu = !showUserMenu}>
          <span class="user-avatar">{user?.profileImage || '👤'}</span>
          <span class="user-name">{user?.name || '사용자'}</span>
          <span class="dropdown-arrow">▼</span>
        </button>
        {#if showUserMenu}
          <div class="user-dropdown">
            <button class="dropdown-item" on:click={handleLogout}>
              🚪 로그아웃
            </button>
          </div>
        {/if}
      </div>
    </div>
  </aside>

  <!-- Mobile Header -->
  <header class="mobile-header">
    <button class="menu-toggle" aria-label="메뉴 열기" on:click={() => showMobileMenu = !showMobileMenu}>
      <span class="hamburger" class:open={showMobileMenu}></span>
    </button>
    <div class="mobile-logo">
      <span>🦷</span>
      <span>손치카</span>
    </div>
    <button class="mobile-user" on:click={handleLogout} aria-label="로그아웃">
      {user?.profileImage || '👤'}
    </button>
  </header>

  <!-- Mobile Menu Overlay -->
  {#if showMobileMenu}
    <button class="overlay" on:click={() => showMobileMenu = false} aria-label="메뉴 닫기"></button>
  {/if}

  <!-- Main Content -->
  <main class="main-content">
    <div class="content-wrapper">
      {#if currentView === 'dashboard'}
        <section class="dashboard animate-fade-in">
          <!-- Welcome Banner -->
          <div class="welcome-banner">
            <div class="welcome-content">
              <h1>{user?.name || '사용자'}님, 안녕하세요! 👋</h1>
              <p>오늘도 아이들의 건강한 치아를 위해 함께해요</p>
            </div>
            <div class="welcome-illustration">
              <span class="tooth-character">🦷</span>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <button class="quick-action-btn primary" on:click={() => currentView = 'brushing'}>
              <span class="action-icon">🪥</span>
              <span class="action-text">치카치카 시작</span>
            </button>
            <button class="quick-action-btn secondary" on:click={() => currentView = 'daily'}>
              <span class="action-icon">✅</span>
              <span class="action-text">오늘 체크</span>
            </button>
          </div>

          <!-- Children Cards -->
          <div class="section-header">
            <h2>우리 아이들</h2>
            <div class="section-header-right">
              <span class="section-badge">{(data.children || []).length}명</span>
              <button class="add-btn" on:click={openAddChildModal}>+ 추가</button>
            </div>
          </div>

          {#if (data.children || []).length === 0}
            <div class="empty-state">
              <span class="empty-icon">👶</span>
              <p>아직 등록된 자녀가 없어요</p>
              <button class="add-child-btn" on:click={openAddChildModal}>+ 자녀 추가하기</button>
            </div>
          {:else}
            <div class="children-grid">
              {#each data.children || [] as child, i}
                <div style="animation-delay: {i * 100}ms" class="animate-fade-in child-card-wrapper">
                  <ChildProfile {child} on:select={() => selectChild(child.id)} />
                  <div class="child-actions">
                    <button class="child-action-btn edit" on:click={() => openEditChildModal(child)} title="수정">✏️</button>
                    <button class="child-action-btn delete" on:click={() => handleDeleteChild(child.id)} title="삭제">🗑️</button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}

          <!-- Upcoming Appointments -->
          {#if getUpcomingAppointments().length > 0}
            <div class="section-header">
              <h2>다가오는 일정</h2>
              <button class="see-all-btn" on:click={() => currentView = 'calendar'}>
                전체보기 →
              </button>
            </div>
            <div class="appointments-list">
              {#each getUpcomingAppointments() as apt, i}
                <div class="appointment-card animate-fade-in" style="animation-delay: {i * 100}ms">
                  <div class="apt-badge" class:urgent={getDaysUntil(apt.date) === '오늘' || getDaysUntil(apt.date) === '내일'}>
                    {getDaysUntil(apt.date)}
                  </div>
                  <div class="apt-content">
                    <span class="apt-child">{getChildName(apt.childId)}</span>
                    <span class="apt-type">{apt.type}</span>
                  </div>
                  <div class="apt-datetime">
                    <span class="apt-date">{apt.date}</span>
                    <span class="apt-time">{apt.time}</span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </section>

      {:else if currentView === 'brushing'}
        <BrushingTimer children={data.children || []} />

      {:else if currentView === 'calendar'}
        <Calendar
          bind:appointments={data.appointments}
          children={data.children || []}
          on:update={updateData}
        />

      {:else if currentView === 'history'}
        <TreatmentHistory
          bind:treatments={data.treatments}
          children={data.children || []}
          on:update={updateData}
        />

      {:else if currentView === 'daily'}
        <DailyCheckList
          bind:dailyChecks={data.dailyChecks}
          children={data.children || []}
          on:update={updateData}
        />

      {:else if currentView === 'stats'}
        <CostStats costs={data.costs || []} children={data.children || []} />

      {:else if currentView === 'timeline'}
        <Timeline milestones={data.milestones || []} children={data.children || []} />
      {/if}
    </div>
  </main>
</div>

<!-- 자녀 추가/수정 모달 -->
{#if showChildModal}
  <div class="modal-overlay" on:click={closeChildModal} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && closeChildModal()}>
    <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3>{editingChild ? '자녀 정보 수정' : '새 자녀 추가'}</h3>
        <button class="modal-close" on:click={closeChildModal}>✕</button>
      </div>

      <form class="modal-body" on:submit|preventDefault={handleSaveChild}>
        <div class="form-group">
          <label for="child-name">이름 *</label>
          <input
            type="text"
            id="child-name"
            bind:value={childForm.name}
            placeholder="아이 이름"
            required
          />
        </div>

        <div class="form-group">
          <label for="child-birth">생년월일 *</label>
          <input
            type="month"
            id="child-birth"
            bind:value={childForm.birthDate}
            required
          />
        </div>

        <div class="form-group">
          <label>성별</label>
          <div class="gender-options">
            {#each genderOptions as option}
              <label class="gender-option" class:selected={childForm.gender === option.value}>
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  bind:group={childForm.gender}
                />
                <span class="gender-emoji">{option.emoji}</span>
                <span>{option.label}</span>
              </label>
            {/each}
          </div>
        </div>

        <div class="form-group">
          <label for="child-note">메모</label>
          <textarea
            id="child-note"
            bind:value={childForm.note}
            placeholder="특이사항이나 메모를 입력하세요"
            rows="3"
          ></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" on:click={closeChildModal}>취소</button>
          <button type="submit" class="btn-save">
            {editingChild ? '저장' : '추가하기'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .app-container {
    display: flex;
    min-height: 100vh;
  }

  /* Sidebar */
  .sidebar {
    width: 240px;
    background: white;
    border-right: 1px solid var(--mint-100);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
    box-shadow: var(--shadow-sm);
  }

  .sidebar-header {
    padding: var(--space-xl);
    border-bottom: 1px solid var(--mint-100);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .logo-icon {
    font-size: 2.5rem;
    animation: float 3s ease-in-out infinite;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
  }

  .logo-title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--primary);
  }

  .logo-subtitle {
    font-size: 0.75rem;
    color: var(--text-muted);
    letter-spacing: 0.5px;
  }

  .nav-menu {
    flex: 1;
    padding: var(--space-lg) var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    background: transparent;
    border-radius: var(--radius-lg);
    color: var(--text-muted);
    font-size: 0.95rem;
    position: relative;
    overflow: hidden;
  }

  .nav-item:hover {
    background: var(--mint-50);
    color: var(--primary);
  }

  .nav-item.active {
    background: linear-gradient(135deg, var(--mint-100) 0%, var(--mint-50) 100%);
    color: var(--primary-dark);
    font-weight: 600;
  }

  .nav-icon {
    font-size: 1.25rem;
  }

  .nav-indicator {
    position: absolute;
    right: 0;
    width: 4px;
    height: 60%;
    background: var(--primary);
    border-radius: var(--radius-full) 0 0 var(--radius-full);
  }

  .sidebar-footer {
    padding: var(--space-md);
    border-top: 1px solid var(--mint-100);
  }

  .user-section {
    position: relative;
  }

  .user-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    padding: var(--space-md);
    background: var(--mint-50);
    border-radius: var(--radius-lg);
    transition: all var(--transition-fast);
  }

  .user-btn:hover {
    background: var(--mint-100);
  }

  .user-avatar {
    font-size: 1.5rem;
  }

  .user-name {
    flex: 1;
    text-align: left;
    font-weight: 500;
    color: var(--navy-700);
  }

  .dropdown-arrow {
    font-size: 0.6rem;
    color: var(--text-muted);
  }

  .user-dropdown {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    background: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    margin-bottom: var(--space-sm);
    overflow: hidden;
  }

  .dropdown-item {
    width: 100%;
    padding: var(--space-md);
    text-align: left;
    background: transparent;
    color: var(--navy-700);
    transition: background var(--transition-fast);
  }

  .dropdown-item:hover {
    background: var(--mint-50);
  }

  /* Mobile Header */
  .mobile-header {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: white;
    border-bottom: 1px solid var(--mint-100);
    padding: 0 var(--space-lg);
    align-items: center;
    justify-content: space-between;
    z-index: 90;
    box-shadow: var(--shadow-sm);
  }

  .menu-toggle {
    width: 40px;
    height: 40px;
    background: var(--mint-50);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hamburger {
    width: 18px;
    height: 2px;
    background: var(--primary);
    position: relative;
    transition: var(--transition-normal);
  }

  .hamburger::before,
  .hamburger::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 2px;
    background: var(--primary);
    transition: var(--transition-normal);
  }

  .hamburger::before { top: -6px; }
  .hamburger::after { bottom: -6px; }

  .hamburger.open {
    background: transparent;
  }

  .hamburger.open::before {
    top: 0;
    transform: rotate(45deg);
  }

  .hamburger.open::after {
    bottom: 0;
    transform: rotate(-45deg);
  }

  .mobile-logo {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-family: var(--font-display);
    font-weight: 700;
    color: var(--primary);
  }

  .mobile-user {
    width: 40px;
    height: 40px;
    background: var(--mint-50);
    border-radius: 50%;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 95;
    backdrop-filter: blur(2px);
    border: none;
    cursor: pointer;
  }

  /* Main Content */
  .main-content {
    flex: 1;
    margin-left: 240px;
    min-height: 100vh;
  }

  .content-wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-lg);
  }

  /* Dashboard */
  .welcome-banner {
    background: linear-gradient(135deg, var(--purple-400) 0%, var(--purple-500) 50%, var(--purple-600) 100%);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
    position: relative;
    overflow: hidden;
  }

  .welcome-banner::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  .welcome-content h1 {
    color: white;
    font-size: 1.125rem;
    margin-bottom: var(--space-xs);
  }

  .welcome-content p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.85rem;
  }

  .tooth-character {
    font-size: 3rem;
    animation: float 3s ease-in-out infinite;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  }

  /* Quick Actions */
  .quick-actions {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
  }

  .quick-action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    min-height: 56px;
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    font-size: 1rem;
    font-weight: 700;
    transition: all var(--transition-bounce);
  }

  .quick-action-btn.primary {
    background: linear-gradient(135deg, var(--coral-400) 0%, var(--coral-500) 100%);
    color: white;
    box-shadow: 0 4px 14px rgba(255, 123, 46, 0.4);
  }

  .quick-action-btn.primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(255, 123, 46, 0.5);
  }

  .quick-action-btn.secondary {
    background: white;
    color: var(--primary);
    border: 2px solid var(--cyan-300);
  }

  .quick-action-btn.secondary:hover {
    background: var(--cyan-50);
    border-color: var(--cyan-400);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  .action-icon {
    font-size: 1.5rem;
  }

  /* Section Header */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-lg);
  }

  .section-header h2 {
    color: var(--navy-800);
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .section-badge {
    background: var(--mint-100);
    color: var(--primary);
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-full);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .see-all-btn {
    background: transparent;
    color: var(--primary);
    font-size: 0.9rem;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
  }

  .see-all-btn:hover {
    background: var(--mint-50);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: var(--space-xl) var(--space-lg);
    background: white;
    border-radius: var(--radius-lg);
    border: 2px dashed var(--mint-300);
    margin-bottom: var(--space-xl);
  }

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: var(--space-md);
  }

  .empty-state p {
    color: var(--text-muted);
    margin-bottom: var(--space-lg);
    font-size: 1rem;
  }

  .add-child-btn {
    min-height: 48px;
    padding: var(--space-md) var(--space-xl);
    background: var(--primary);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 1rem;
    transition: all var(--transition-bounce);
    box-shadow: var(--shadow-md);
  }

  .add-child-btn:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  /* Children Grid */
  .children-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-lg);
    margin-bottom: var(--space-2xl);
  }

  /* Appointments */
  .appointments-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .appointment-card {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    background: white;
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--mint-100);
    transition: all var(--transition-normal);
  }

  .appointment-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateX(5px);
  }

  .apt-badge {
    background: var(--mint-100);
    color: var(--primary-dark);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 0.85rem;
    min-width: 60px;
    text-align: center;
  }

  .apt-badge.urgent {
    background: linear-gradient(135deg, var(--coral-400) 0%, var(--coral-500) 100%);
    color: white;
    animation: pulse-soft 2s ease-in-out infinite;
  }

  .apt-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .apt-child {
    font-weight: 700;
    color: var(--navy-800);
  }

  .apt-type {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .apt-datetime {
    text-align: right;
  }

  .apt-date {
    display: block;
    color: var(--navy-700);
    font-weight: 500;
  }

  .apt-time {
    display: block;
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
      transition: transform var(--transition-slow);
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .mobile-header {
      display: flex;
    }

    .overlay {
      display: block;
    }

    .main-content {
      margin-left: 0;
      padding-top: 56px;
    }

    .content-wrapper {
      padding: var(--space-md);
    }

    .welcome-banner {
      flex-direction: column;
      text-align: center;
      gap: var(--space-md);
      padding: var(--space-md);
    }

    .welcome-content h1 {
      font-size: 1rem;
    }

    .welcome-content p {
      font-size: 0.8rem;
    }

    .tooth-character {
      font-size: 2.5rem;
    }

    .quick-actions {
      flex-direction: row;
      gap: var(--space-sm);
    }

    .quick-action-btn {
      min-height: 48px;
      padding: var(--space-sm) var(--space-md);
      font-size: 0.85rem;
    }

    .action-icon {
      font-size: 1.25rem;
    }

    .children-grid {
      grid-template-columns: 1fr;
    }

    .appointment-card {
      flex-wrap: wrap;
    }

    .apt-datetime {
      width: 100%;
      text-align: left;
      margin-top: var(--space-sm);
      padding-top: var(--space-sm);
      border-top: 1px solid var(--mint-100);
    }
  }

  @media (max-width: 480px) {
    .content-wrapper {
      padding: var(--space-sm);
    }

    .welcome-banner {
      padding: var(--space-sm);
    }

    .welcome-content h1 {
      font-size: 0.9rem;
    }

    .quick-action-btn {
      padding: var(--space-xs) var(--space-sm);
      font-size: 0.8rem;
    }

    .action-icon {
      font-size: 1.125rem;
    }

    .section-header h2 {
      font-size: 1rem;
    }
  }

  /* Section Header Right */
  .section-header-right {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .add-btn {
    background: var(--primary);
    color: white;
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    font-weight: 600;
    transition: all var(--transition-fast);
  }

  .add-btn:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }

  /* Child Card Wrapper */
  .child-card-wrapper {
    position: relative;
  }

  .child-actions {
    position: absolute;
    top: var(--space-sm);
    right: var(--space-sm);
    display: flex;
    gap: var(--space-xs);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .child-card-wrapper:hover .child-actions {
    opacity: 1;
  }

  .child-action-btn {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
  }

  .child-action-btn.edit:hover {
    background: var(--mint-100);
  }

  .child-action-btn.delete:hover {
    background: var(--coral-100);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: var(--space-2xl);
    background: white;
    border-radius: var(--radius-xl);
    border: 2px dashed var(--mint-200);
  }

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: var(--space-md);
  }

  .empty-state p {
    color: var(--text-muted);
    margin-bottom: var(--space-lg);
  }

  .add-child-btn {
    background: var(--primary);
    color: white;
    padding: var(--space-md) var(--space-xl);
    border-radius: var(--radius-lg);
    font-weight: 600;
    transition: all var(--transition-bounce);
  }

  .add-child-btn:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    padding: var(--space-lg);
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: white;
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 450px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    animation: bounceIn 0.3s ease-out;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg) var(--space-xl);
    border-bottom: 1px solid var(--mint-100);
  }

  .modal-header h3 {
    font-size: 1.25rem;
    color: var(--navy-800);
  }

  .modal-close {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background: var(--mint-50);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    transition: all var(--transition-fast);
  }

  .modal-close:hover {
    background: var(--mint-100);
    color: var(--navy-800);
  }

  .modal-body {
    padding: var(--space-xl);
  }

  .form-group {
    margin-bottom: var(--space-lg);
  }

  .form-group label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--navy-700);
    margin-bottom: var(--space-sm);
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: var(--space-md);
    border: 2px solid var(--mint-200);
    border-radius: var(--radius-md);
    font-size: 1rem;
    transition: border-color var(--transition-fast);
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--primary);
  }

  .form-group textarea {
    resize: vertical;
  }

  .gender-options {
    display: flex;
    gap: var(--space-md);
  }

  .gender-option {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-md);
    border: 2px solid var(--mint-200);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .gender-option input {
    display: none;
  }

  .gender-option:hover {
    border-color: var(--primary);
  }

  .gender-option.selected {
    border-color: var(--primary);
    background: var(--mint-50);
  }

  .gender-emoji {
    font-size: 1.5rem;
  }

  .modal-actions {
    display: flex;
    gap: var(--space-md);
    margin-top: var(--space-xl);
  }

  .btn-cancel,
  .btn-save {
    flex: 1;
    padding: var(--space-md);
    border-radius: var(--radius-lg);
    font-size: 1rem;
    font-weight: 600;
    transition: all var(--transition-fast);
  }

  .btn-cancel {
    background: var(--mint-100);
    color: var(--text-muted);
  }

  .btn-cancel:hover {
    background: var(--mint-200);
  }

  .btn-save {
    background: var(--primary);
    color: white;
  }

  .btn-save:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }
</style>
