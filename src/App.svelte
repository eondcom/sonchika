<script>
  import { onMount } from 'svelte';
  import { currentUser, isAuthenticated, isAdmin, initAuth, logout } from './lib/auth.js';
  import { database, initDatabase } from './lib/dataStore.js';
  import Login from './components/Login.svelte';
  import UserApp from './components/UserApp.svelte';
  import AdminDashboard from './components/AdminDashboard.svelte';

  let isLoading = true;

  onMount(() => {
    // 데이터베이스 초기화
    initDatabase();
    // 인증 상태 복원
    initAuth();
    isLoading = false;
  });

  function handleLogin(event) {
    // Login 컴포넌트에서 로그인 성공 시 호출됨
    // currentUser는 auth.js에서 자동으로 업데이트됨
  }

  function handleLogout() {
    logout();
  }
</script>

{#if isLoading}
  <!-- 로딩 화면 -->
  <div class="loading-screen">
    <div class="loading-content">
      <span class="loading-icon">🦷</span>
      <p class="loading-text">손치카</p>
      <div class="loading-spinner"></div>
    </div>
  </div>
{:else if !$isAuthenticated}
  <!-- 로그인 화면 -->
  <Login on:login={handleLogin} />
{:else if $isAdmin}
  <!-- 관리자 화면 -->
  <AdminDashboard user={$currentUser} on:logout={handleLogout} />
{:else}
  <!-- 사용자 화면 -->
  <UserApp user={$currentUser} on:logout={handleLogout} />
{/if}

<style>
  .loading-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--mint-50) 0%, var(--cream) 50%, var(--coral-50) 100%);
  }

  .loading-content {
    text-align: center;
  }

  .loading-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: var(--space-md);
    animation: float 2s ease-in-out infinite;
  }

  .loading-text {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: var(--space-lg);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--mint-200);
    border-top-color: var(--primary);
    border-radius: 50%;
    margin: 0 auto;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
</style>
