<script>
  import { createEventDispatcher } from 'svelte';
  import { calculateAge } from '../lib/dataStore.js';

  export let child;

  const dispatch = createEventDispatcher();

  $: currentAge = calculateAge(child.birthDate);
</script>

<div class="child-card" on:click={() => dispatch('select')} role="button" tabindex="0">
  <div class="card-glow"></div>

  <div class="profile-section">
    <div class="avatar-wrapper">
      <span class="avatar">{child.profileImage}</span>
      <span class="avatar-ring"></span>
    </div>
    <div class="info">
      <h3>{child.name}</h3>
      <p class="age">만 {currentAge}세</p>
      <p class="birth">{child.birthDate} 생</p>
    </div>
  </div>

  <div class="teeth-status">
    <div class="status-item">
      <div class="status-icon" class:active={child.permanentTeethStatus?.firstMolar}>
        {child.permanentTeethStatus?.firstMolar ? '🦷' : '⏳'}
      </div>
      <div class="status-info">
        <span class="status-label">첫 어금니</span>
        <span class="status-value" class:active={child.permanentTeethStatus?.firstMolar}>
          {child.permanentTeethStatus?.firstMolar ? '맹출' : '대기'}
        </span>
      </div>
    </div>
    <div class="status-divider"></div>
    <div class="status-item">
      <div class="status-icon" class:active={child.permanentTeethStatus?.lowerIncisors}>
        {child.permanentTeethStatus?.lowerIncisors ? '🦷' : '⏳'}
      </div>
      <div class="status-info">
        <span class="status-label">앞니 교체</span>
        <span class="status-value" class:active={child.permanentTeethStatus?.lowerIncisors}>
          {child.permanentTeethStatus?.lowerIncisors ? '완료' : '대기'}
        </span>
      </div>
    </div>
  </div>

  <div class="card-footer">
    <span class="view-more">자세히 보기 →</span>
  </div>
</div>

<style>
  .child-card {
    position: relative;
    background: white;
    border-radius: var(--radius-xl);
    padding: var(--space-xl);
    cursor: pointer;
    transition: all var(--transition-bounce);
    border: 2px solid var(--mint-100);
    overflow: hidden;
  }

  .child-card:hover {
    transform: translateY(-8px);
    border-color: var(--primary);
    box-shadow: var(--shadow-lg);
  }

  .child-card:hover .card-glow {
    opacity: 1;
  }

  .child-card:hover .avatar {
    animation: wiggle 0.5s ease-in-out;
  }

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--mint-400), var(--coral-400), var(--yellow-400));
    opacity: 0;
    transition: opacity var(--transition-normal);
  }

  .profile-section {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
  }

  .avatar-wrapper {
    position: relative;
  }

  .avatar {
    font-size: 3.5rem;
    display: block;
    transition: transform var(--transition-bounce);
  }

  .avatar-ring {
    position: absolute;
    inset: -8px;
    border: 3px dashed var(--mint-200);
    border-radius: 50%;
    animation: spin 20s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .info {
    text-align: left;
  }

  .info h3 {
    font-size: 1.5rem;
    color: var(--navy-800);
    margin-bottom: var(--space-xs);
  }

  .age {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: var(--space-xs);
  }

  .birth {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .teeth-status {
    display: flex;
    align-items: center;
    background: var(--mint-50);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    margin-bottom: var(--space-lg);
  }

  .status-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .status-divider {
    width: 1px;
    height: 40px;
    background: var(--mint-200);
    margin: 0 var(--space-md);
  }

  .status-icon {
    width: 36px;
    height: 36px;
    background: white;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    transition: all var(--transition-normal);
  }

  .status-icon.active {
    background: linear-gradient(135deg, var(--mint-100) 0%, var(--mint-200) 100%);
  }

  .status-info {
    display: flex;
    flex-direction: column;
  }

  .status-label {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .status-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--navy-600);
  }

  .status-value.active {
    color: var(--primary);
  }

  .card-footer {
    text-align: center;
  }

  .view-more {
    font-size: 0.85rem;
    color: var(--primary);
    font-weight: 600;
    opacity: 0.7;
    transition: opacity var(--transition-fast);
  }

  .child-card:hover .view-more {
    opacity: 1;
  }

  @media (max-width: 480px) {
    .profile-section {
      flex-direction: column;
      text-align: center;
    }

    .info {
      text-align: center;
    }

    .teeth-status {
      flex-direction: column;
      gap: var(--space-md);
    }

    .status-divider {
      width: 80%;
      height: 1px;
      margin: 0;
    }
  }
</style>
