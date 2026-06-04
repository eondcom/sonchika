<script>
  import { createEventDispatcher } from 'svelte';
  import { loginWithKakao, login, loginAsAdmin, demoLogin } from '../lib/auth.js';
  import { database } from '../lib/dataStore.js';

  const dispatch = createEventDispatcher();

  let showAdminLogin = false;
  let adminEmail = '';
  let adminPassword = '';
  let isLoading = false;
  let error = '';

  async function handleKakaoLogin() {
    isLoading = true;
    error = '';

    try {
      // Mock 카카오 로그인
      const kakaoData = await loginWithKakao();
      const user = await login(kakaoData, $database);
      dispatch('login', user);
    } catch (e) {
      error = '로그인에 실패했습니다. 다시 시도해주세요.';
    } finally {
      isLoading = false;
    }
  }

  async function handleAdminLogin() {
    isLoading = true;
    error = '';

    try {
      const user = await loginAsAdmin(adminEmail, adminPassword);
      dispatch('login', user);
    } catch (e) {
      error = e.message;
    } finally {
      isLoading = false;
    }
  }

  function handleDemoLogin() {
    const user = demoLogin($database);
    if (user) {
      dispatch('login', user);
    }
  }
</script>

<div class="login-container">
  <div class="login-background">
    <div class="bg-circle c1"></div>
    <div class="bg-circle c2"></div>
    <div class="bg-circle c3"></div>
  </div>

  <div class="login-card">
    <div class="logo-section">
      <div class="logo-icon animate-float">🦷</div>
      <h1>손치카</h1>
      <p class="tagline">우리 아이 치아 건강 관리</p>
    </div>

    {#if !showAdminLogin}
      <!-- 일반 사용자 로그인 -->
      <div class="login-section">
        <button class="kakao-btn" on:click={handleKakaoLogin} disabled={isLoading}>
          <svg viewBox="0 0 24 24" class="kakao-icon">
            <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.043 5.926l-.857 3.18c-.07.26.196.468.426.33l3.865-2.547c.796.1 1.61.111 2.523.111 5.523 0 10-3.477 10-8 0-4.023-4.477-7.5-10-7.5z" fill="currentColor"/>
          </svg>
          <span>카카오로 시작하기</span>
        </button>

        <div class="divider">
          <span>또는</span>
        </div>

        <button class="demo-btn" on:click={handleDemoLogin}>
          <span>👀</span>
          <span>데모 체험하기</span>
        </button>

        <button class="admin-link" on:click={() => showAdminLogin = true}>
          관리자 로그인
        </button>
      </div>
    {:else}
      <!-- 관리자 로그인 -->
      <div class="login-section admin-section">
        <h3>관리자 로그인</h3>

        <form on:submit|preventDefault={handleAdminLogin}>
          <div class="input-group">
            <label for="email">이메일</label>
            <input
              type="email"
              id="email"
              bind:value={adminEmail}
              placeholder="admin@sonchika.com"
              required
            />
          </div>

          <div class="input-group">
            <label for="password">비밀번호</label>
            <input
              type="password"
              id="password"
              bind:value={adminPassword}
              placeholder="••••••••"
              required
            />
          </div>

          {#if error}
            <p class="error-message">{error}</p>
          {/if}

          <button type="submit" class="submit-btn" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <button class="back-link" on:click={() => showAdminLogin = false}>
          ← 사용자 로그인으로
        </button>
      </div>
    {/if}

    <div class="features">
      <div class="feature">
        <span class="feature-icon">🪥</span>
        <span class="feature-text">양치 타이머</span>
      </div>
      <div class="feature">
        <span class="feature-icon">📅</span>
        <span class="feature-text">진료 일정</span>
      </div>
      <div class="feature">
        <span class="feature-icon">📊</span>
        <span class="feature-text">성장 기록</span>
      </div>
    </div>
  </div>

  <p class="copyright">© 2026 손치카 Sonchika</p>
</div>

<style>
  .login-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    position: relative;
    overflow: hidden;
  }

  .login-background {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .bg-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.5;
  }

  .c1 {
    width: 400px;
    height: 400px;
    background: var(--purple-200);
    top: -100px;
    right: -100px;
    animation: float 8s ease-in-out infinite;
  }

  .c2 {
    width: 300px;
    height: 300px;
    background: var(--cyan-200);
    bottom: -50px;
    left: -50px;
    animation: float 6s ease-in-out infinite reverse;
  }

  .c3 {
    width: 200px;
    height: 200px;
    background: var(--lavender-300);
    top: 40%;
    left: 10%;
    animation: float 10s ease-in-out infinite;
    opacity: 0.4;
  }

  .login-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--space-xl) var(--space-lg);
    width: 100%;
    max-width: 400px;
    box-shadow: var(--shadow-lg);
    position: relative;
    z-index: 1;
  }

  .logo-section {
    text-align: center;
    margin-bottom: var(--space-xl);
  }

  .logo-icon {
    font-size: 3.5rem;
    display: block;
    margin-bottom: var(--space-md);
  }

  .logo-section h1 {
    font-size: 1.75rem;
    color: var(--primary);
    margin-bottom: var(--space-xs);
  }

  .tagline {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .login-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .kakao-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    width: 100%;
    min-height: 52px;
    padding: var(--space-md) var(--space-lg);
    background: #FEE500;
    color: #191919;
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 1rem;
    transition: all var(--transition-bounce);
    box-shadow: 0 3px 12px rgba(254, 229, 0, 0.3);
  }

  .kakao-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 16px rgba(254, 229, 0, 0.5);
  }

  .kakao-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .kakao-icon {
    width: 22px;
    height: 22px;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    color: var(--text-muted);
    font-size: 0.85rem;
    margin: var(--space-sm) 0;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--mint-200);
  }

  .demo-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    width: 100%;
    min-height: 52px;
    padding: var(--space-md) var(--space-lg);
    background: white;
    color: var(--primary);
    border: 2px solid var(--mint-300);
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 1rem;
    transition: all var(--transition-bounce);
  }

  .demo-btn:hover {
    background: var(--mint-50);
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .admin-link {
    background: transparent;
    color: var(--text-muted);
    font-size: 0.85rem;
    margin-top: var(--space-md);
    text-decoration: underline;
    min-height: 40px;
  }

  .admin-link:hover {
    color: var(--primary);
  }

  /* 관리자 로그인 폼 */
  .admin-section h3 {
    text-align: center;
    color: var(--navy-800);
    margin-bottom: var(--space-xl);
  }

  .input-group {
    margin-bottom: var(--space-md);
  }

  .input-group label {
    display: block;
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: var(--space-xs);
  }

  .input-group input {
    width: 100%;
    padding: var(--space-md);
    border: 2px solid var(--mint-200);
    border-radius: var(--radius-md);
    font-size: 1rem;
    transition: border-color var(--transition-fast);
  }

  .input-group input:focus {
    outline: none;
    border-color: var(--primary);
  }

  .error-message {
    color: var(--coral-500);
    font-size: 0.85rem;
    text-align: center;
    margin-bottom: var(--space-md);
  }

  .submit-btn {
    width: 100%;
    padding: var(--space-md) var(--space-lg);
    background: var(--primary);
    color: white;
    border-radius: var(--radius-lg);
    font-weight: 600;
    transition: all var(--transition-bounce);
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .back-link {
    background: transparent;
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-top: var(--space-lg);
    text-align: center;
    display: block;
    width: 100%;
  }

  .back-link:hover {
    color: var(--primary);
  }

  /* 기능 소개 */
  .features {
    display: flex;
    justify-content: center;
    gap: var(--space-lg);
    margin-top: var(--space-xl);
    padding-top: var(--space-lg);
    border-top: 1px solid var(--mint-100);
  }

  .feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    min-width: 60px;
  }

  .feature-icon {
    font-size: 1.75rem;
  }

  .feature-text {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .copyright {
    margin-top: var(--space-lg);
    color: var(--text-muted);
    font-size: 0.8rem;
    position: relative;
    z-index: 1;
  }

  @media (max-width: 480px) {
    .login-card {
      padding: var(--space-lg) var(--space-md);
    }

    .logo-icon {
      font-size: 3rem;
    }

    .logo-section h1 {
      font-size: 1.5rem;
    }

    .kakao-btn,
    .demo-btn {
      min-height: 48px;
      font-size: 0.9rem;
    }

    .features {
      gap: var(--space-md);
    }

    .feature-icon {
      font-size: 1.5rem;
    }

    .feature-text {
      font-size: 0.7rem;
    }
  }
</style>
