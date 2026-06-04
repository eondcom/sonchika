<script>
  import { createEventDispatcher } from 'svelte';
  import { database, getAllUsers, getStatistics, getAllTickets, addNotice, replyToTicket } from '../lib/dataStore.js';
  import { logout } from '../lib/auth.js';

  const dispatch = createEventDispatcher();

  let currentView = 'dashboard';
  let stats = null;
  let users = [];
  let tickets = [];

  // 공지사항 폼
  let noticeTitle = '';
  let noticeContent = '';
  let noticeImportant = false;

  // 답변 폼
  let replyText = '';
  let selectedTicket = null;

  $: if ($database) {
    stats = getStatistics();
    users = getAllUsers();
    tickets = getAllTickets();
  }

  function handleLogout() {
    logout();
    dispatch('logout');
  }

  function handleAddNotice() {
    if (!noticeTitle || !noticeContent) return;

    addNotice({
      title: noticeTitle,
      content: noticeContent,
      isImportant: noticeImportant
    });

    noticeTitle = '';
    noticeContent = '';
    noticeImportant = false;
    alert('공지사항이 등록되었습니다.');
  }

  function handleReply(ticket) {
    selectedTicket = ticket;
    replyText = '';
  }

  function submitReply() {
    if (!replyText || !selectedTicket) return;

    replyToTicket(selectedTicket.id, replyText);
    selectedTicket = null;
    replyText = '';
    tickets = getAllTickets();
  }

  function getUserById(userId) {
    return $database?.users?.find(u => u.id === userId);
  }

  function getChildrenCount(userId) {
    return $database?.children?.filter(c => c.userId === userId).length || 0;
  }
</script>

<div class="admin-container">
  <!-- 사이드바 -->
  <aside class="admin-sidebar">
    <div class="sidebar-header">
      <span class="admin-logo">🦷</span>
      <div>
        <h2>손치카</h2>
        <span class="admin-badge">관리자</span>
      </div>
    </div>

    <nav class="admin-nav">
      <button
        class="nav-btn"
        class:active={currentView === 'dashboard'}
        on:click={() => currentView = 'dashboard'}
      >
        📊 대시보드
      </button>
      <button
        class="nav-btn"
        class:active={currentView === 'users'}
        on:click={() => currentView = 'users'}
      >
        👥 사용자 관리
      </button>
      <button
        class="nav-btn"
        class:active={currentView === 'notices'}
        on:click={() => currentView = 'notices'}
      >
        📢 공지사항
      </button>
      <button
        class="nav-btn"
        class:active={currentView === 'support'}
        on:click={() => currentView = 'support'}
      >
        💬 고객지원
        {#if stats?.pendingSupport > 0}
          <span class="badge">{stats.pendingSupport}</span>
        {/if}
      </button>
    </nav>

    <button class="logout-btn" on:click={handleLogout}>
      🚪 로그아웃
    </button>
  </aside>

  <!-- 메인 컨텐츠 -->
  <main class="admin-main">
    {#if currentView === 'dashboard'}
      <div class="page-header">
        <h1>대시보드</h1>
        <p>손치카 서비스 현황을 한눈에 확인하세요</p>
      </div>

      <!-- 통계 카드 -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">👥</span>
          <div class="stat-info">
            <span class="stat-value">{stats?.totalUsers || 0}</span>
            <span class="stat-label">총 사용자</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">👶</span>
          <div class="stat-info">
            <span class="stat-value">{stats?.totalChildren || 0}</span>
            <span class="stat-label">등록 자녀</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📅</span>
          <div class="stat-info">
            <span class="stat-value">{stats?.totalAppointments || 0}</span>
            <span class="stat-label">예약 건수</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💬</span>
          <div class="stat-info">
            <span class="stat-value">{stats?.pendingSupport || 0}</span>
            <span class="stat-label">대기 문의</span>
          </div>
        </div>
      </div>

      <!-- 최근 사용자 -->
      <section class="recent-section">
        <h3>최근 활동 사용자</h3>
        <div class="recent-users">
          {#each stats?.recentUsers || [] as user}
            <div class="user-row">
              <span class="user-avatar">{user.profileImage}</span>
              <div class="user-info">
                <span class="user-name">{user.name}</span>
                <span class="user-email">{user.email}</span>
              </div>
              <span class="user-date">{user.lastLogin}</span>
            </div>
          {/each}
        </div>
      </section>

    {:else if currentView === 'users'}
      <div class="page-header">
        <h1>사용자 관리</h1>
        <p>가입된 사용자 목록을 관리합니다</p>
      </div>

      <div class="users-table-wrapper">
        <table class="users-table">
          <thead>
            <tr>
              <th>프로필</th>
              <th>이름</th>
              <th>이메일</th>
              <th>자녀 수</th>
              <th>가입일</th>
              <th>최근 접속</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {#each users as user}
              <tr>
                <td><span class="table-avatar">{user.profileImage}</span></td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{getChildrenCount(user.id)}명</td>
                <td>{user.createdAt}</td>
                <td>{user.lastLogin}</td>
                <td>
                  <span class="status-badge" class:active={user.status === 'active'}>
                    {user.status === 'active' ? '활성' : '비활성'}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

    {:else if currentView === 'notices'}
      <div class="page-header">
        <h1>공지사항 관리</h1>
        <p>사용자에게 전달할 공지사항을 작성합니다</p>
      </div>

      <div class="notice-form">
        <div class="form-group">
          <label for="title">제목</label>
          <input type="text" id="title" bind:value={noticeTitle} placeholder="공지사항 제목" />
        </div>
        <div class="form-group">
          <label for="content">내용</label>
          <textarea id="content" bind:value={noticeContent} rows="5" placeholder="공지사항 내용을 입력하세요"></textarea>
        </div>
        <div class="form-group checkbox">
          <input type="checkbox" id="important" bind:checked={noticeImportant} />
          <label for="important">중요 공지로 표시</label>
        </div>
        <button class="submit-btn" on:click={handleAddNotice}>공지 등록</button>
      </div>

      <h3>등록된 공지사항</h3>
      <div class="notices-list">
        {#each $database?.notices || [] as notice}
          <div class="notice-item" class:important={notice.isImportant}>
            <div class="notice-header">
              <h4>{notice.title}</h4>
              <span class="notice-date">{notice.createdAt}</span>
            </div>
            <p>{notice.content}</p>
          </div>
        {/each}
      </div>

    {:else if currentView === 'support'}
      <div class="page-header">
        <h1>고객지원</h1>
        <p>사용자 문의를 확인하고 답변합니다</p>
      </div>

      <div class="tickets-list">
        {#each tickets as ticket}
          <div class="ticket-card" class:pending={ticket.status === 'pending'}>
            <div class="ticket-header">
              <span class="ticket-type">{ticket.type}</span>
              <span class="ticket-status" class:pending={ticket.status === 'pending'}>
                {ticket.status === 'pending' ? '대기중' : '답변완료'}
              </span>
            </div>
            <h4>{ticket.title}</h4>
            <p class="ticket-content">{ticket.content}</p>
            <div class="ticket-meta">
              <span>작성자: {getUserById(ticket.userId)?.name || '알 수 없음'}</span>
              <span>{ticket.createdAt}</span>
            </div>

            {#if ticket.replies.length > 0}
              <div class="replies">
                {#each ticket.replies as reply}
                  <div class="reply" class:admin={reply.isAdmin}>
                    <p>{reply.text}</p>
                    <span class="reply-date">{reply.createdAt}</span>
                  </div>
                {/each}
              </div>
            {/if}

            {#if ticket.status === 'pending'}
              {#if selectedTicket?.id === ticket.id}
                <div class="reply-form">
                  <textarea bind:value={replyText} rows="3" placeholder="답변을 입력하세요"></textarea>
                  <div class="reply-actions">
                    <button class="cancel-btn" on:click={() => selectedTicket = null}>취소</button>
                    <button class="send-btn" on:click={submitReply}>답변 전송</button>
                  </div>
                </div>
              {:else}
                <button class="reply-btn" on:click={() => handleReply(ticket)}>답변하기</button>
              {/if}
            {/if}
          </div>
        {/each}

        {#if tickets.length === 0}
          <p class="empty-message">접수된 문의가 없습니다.</p>
        {/if}
      </div>
    {/if}
  </main>
</div>

<style>
  .admin-container {
    display: flex;
    min-height: 100vh;
  }

  /* 사이드바 */
  .admin-sidebar {
    width: 260px;
    background: var(--navy-800);
    color: white;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-xl);
    border-bottom: 1px solid var(--navy-700);
  }

  .admin-logo {
    font-size: 2rem;
  }

  .sidebar-header h2 {
    font-size: 1.25rem;
    margin: 0;
  }

  .admin-badge {
    font-size: 0.7rem;
    background: var(--coral-400);
    padding: 2px 8px;
    border-radius: var(--radius-full);
  }

  .admin-nav {
    flex: 1;
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .nav-btn {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    background: transparent;
    color: var(--navy-200);
    border-radius: var(--radius-md);
    text-align: left;
    transition: all var(--transition-fast);
  }

  .nav-btn:hover {
    background: var(--navy-700);
    color: white;
  }

  .nav-btn.active {
    background: var(--primary);
    color: white;
  }

  .nav-btn .badge {
    margin-left: auto;
    background: var(--coral-400);
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
  }

  .logout-btn {
    margin: var(--space-lg);
    padding: var(--space-md);
    background: var(--navy-700);
    color: var(--navy-200);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .logout-btn:hover {
    background: var(--coral-500);
    color: white;
  }

  /* 메인 컨텐츠 */
  .admin-main {
    flex: 1;
    margin-left: 260px;
    padding: var(--space-2xl);
    background: var(--navy-50);
    min-height: 100vh;
  }

  .page-header {
    margin-bottom: var(--space-2xl);
  }

  .page-header h1 {
    color: var(--navy-800);
    margin-bottom: var(--space-xs);
  }

  .page-header p {
    color: var(--text-muted);
  }

  /* 통계 카드 */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-lg);
    margin-bottom: var(--space-2xl);
  }

  .stat-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    box-shadow: var(--shadow-sm);
  }

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: var(--navy-800);
  }

  .stat-label {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  /* 최근 사용자 */
  .recent-section {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    box-shadow: var(--shadow-sm);
  }

  .recent-section h3 {
    color: var(--navy-800);
    margin-bottom: var(--space-lg);
  }

  .user-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--navy-100);
  }

  .user-row:last-child {
    border-bottom: none;
  }

  .user-avatar {
    font-size: 1.5rem;
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .user-name {
    font-weight: 600;
    color: var(--navy-800);
  }

  .user-email {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .user-date {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  /* 사용자 테이블 */
  .users-table-wrapper {
    background: white;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  .users-table {
    width: 100%;
    border-collapse: collapse;
  }

  .users-table th,
  .users-table td {
    padding: var(--space-md) var(--space-lg);
    text-align: left;
  }

  .users-table th {
    background: var(--navy-50);
    color: var(--navy-700);
    font-weight: 600;
  }

  .users-table tr:not(:last-child) td {
    border-bottom: 1px solid var(--navy-100);
  }

  .table-avatar {
    font-size: 1.5rem;
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: var(--radius-full);
    font-size: 0.8rem;
    background: var(--navy-200);
    color: var(--navy-600);
  }

  .status-badge.active {
    background: var(--mint-100);
    color: var(--primary);
  }

  /* 공지사항 폼 */
  .notice-form {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    margin-bottom: var(--space-2xl);
    box-shadow: var(--shadow-sm);
  }

  .form-group {
    margin-bottom: var(--space-lg);
  }

  .form-group label {
    display: block;
    margin-bottom: var(--space-sm);
    color: var(--navy-700);
    font-weight: 500;
  }

  .form-group input[type="text"],
  .form-group textarea {
    width: 100%;
    padding: var(--space-md);
    border: 2px solid var(--navy-200);
    border-radius: var(--radius-md);
    font-size: 1rem;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--primary);
  }

  .form-group.checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .form-group.checkbox label {
    margin: 0;
  }

  .submit-btn {
    background: var(--primary);
    color: white;
    padding: var(--space-md) var(--space-xl);
    border-radius: var(--radius-md);
    font-weight: 600;
  }

  .submit-btn:hover {
    background: var(--primary-dark);
  }

  /* 공지사항 목록 */
  .notices-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .notice-item {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    border-left: 4px solid var(--navy-200);
  }

  .notice-item.important {
    border-left-color: var(--coral-400);
  }

  .notice-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-sm);
  }

  .notice-header h4 {
    color: var(--navy-800);
  }

  .notice-date {
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  /* 고객지원 */
  .tickets-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .ticket-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-xl);
    box-shadow: var(--shadow-sm);
  }

  .ticket-card.pending {
    border-left: 4px solid var(--coral-400);
  }

  .ticket-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-md);
  }

  .ticket-type {
    background: var(--navy-100);
    color: var(--navy-700);
    padding: 4px 12px;
    border-radius: var(--radius-full);
    font-size: 0.8rem;
  }

  .ticket-status {
    font-size: 0.85rem;
    color: var(--primary);
  }

  .ticket-status.pending {
    color: var(--coral-500);
  }

  .ticket-card h4 {
    color: var(--navy-800);
    margin-bottom: var(--space-sm);
  }

  .ticket-content {
    color: var(--text-muted);
    margin-bottom: var(--space-md);
  }

  .ticket-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: var(--space-md);
  }

  .replies {
    border-top: 1px solid var(--navy-100);
    padding-top: var(--space-md);
    margin-top: var(--space-md);
  }

  .reply {
    background: var(--navy-50);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-sm);
  }

  .reply.admin {
    background: var(--mint-50);
    border-left: 3px solid var(--primary);
  }

  .reply-date {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .reply-form {
    margin-top: var(--space-md);
  }

  .reply-form textarea {
    width: 100%;
    padding: var(--space-md);
    border: 2px solid var(--navy-200);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-sm);
  }

  .reply-actions {
    display: flex;
    gap: var(--space-sm);
    justify-content: flex-end;
  }

  .cancel-btn {
    padding: var(--space-sm) var(--space-lg);
    background: var(--navy-200);
    color: var(--navy-700);
    border-radius: var(--radius-md);
  }

  .send-btn {
    padding: var(--space-sm) var(--space-lg);
    background: var(--primary);
    color: white;
    border-radius: var(--radius-md);
  }

  .reply-btn {
    padding: var(--space-sm) var(--space-lg);
    background: var(--primary);
    color: white;
    border-radius: var(--radius-md);
    margin-top: var(--space-md);
  }

  .empty-message {
    text-align: center;
    color: var(--text-muted);
    padding: var(--space-2xl);
  }

  @media (max-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .admin-sidebar {
      transform: translateX(-100%);
    }

    .admin-main {
      margin-left: 0;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .users-table-wrapper {
      overflow-x: auto;
    }
  }
</style>
