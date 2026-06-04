<script>
  import { onMount, onDestroy } from 'svelte';

  export let children = [];

  let selectedChild = children[0]?.id || null;
  let isRunning = false;
  let currentStep = 0;
  let timeLeft = 0;
  let totalTime = 0;
  let intervalId = null;
  let speechEnabled = false;
  let voices = [];

  const brushingSteps = [
    { id: 0, name: '준비', duration: 5, instruction: '칫솔에 치약을 묻혀주세요!', emoji: '🪥', position: 'center' },
    { id: 1, name: '오른쪽 위', duration: 30, instruction: '오른쪽 위 이빨을 닦아요!', emoji: '🦷', position: 'top-right' },
    { id: 2, name: '왼쪽 위', duration: 30, instruction: '왼쪽 위 이빨을 닦아요!', emoji: '🦷', position: 'top-left' },
    { id: 3, name: '오른쪽 아래', duration: 30, instruction: '오른쪽 아래 이빨을 닦아요!', emoji: '🦷', position: 'bottom-right' },
    { id: 4, name: '왼쪽 아래', duration: 30, instruction: '왼쪽 아래 이빨을 닦아요!', emoji: '🦷', position: 'bottom-left' },
    { id: 5, name: '씹는 면', duration: 30, instruction: '위아래 씹는 면을 닦아요!', emoji: '😬', position: 'center' },
    { id: 6, name: '혀', duration: 15, instruction: '혀도 살살 닦아주세요!', emoji: '👅', position: 'center' },
  ];

  const totalDuration = brushingSteps.reduce((sum, step) => sum + step.duration, 0);

  $: selectedChildData = children.find(c => c.id === selectedChild);
  $: currentStepData = brushingSteps[currentStep];
  $: progressPercent = totalTime > 0 ? ((totalDuration - totalTime + (currentStepData?.duration - timeLeft)) / totalDuration) * 100 : 0;

  function startTimer() {
    if (!selectedChild) return;

    // 음성 활성화 (사용자 인터랙션)
    enableSpeech();

    isRunning = true;
    currentStep = 0;
    totalTime = totalDuration;
    timeLeft = brushingSteps[0].duration;

    // 약간 딜레이 후 음성 재생 (음성 활성화 후)
    setTimeout(() => speak(brushingSteps[0].instruction), 100);

    intervalId = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        totalTime--;

        // 3초 전 카운트다운 음성
        if (timeLeft <= 3 && timeLeft > 0) {
          speak(String(timeLeft));
        }
      } else {
        // 다음 단계로
        if (currentStep < brushingSteps.length - 1) {
          currentStep++;
          timeLeft = brushingSteps[currentStep].duration;
          speak(brushingSteps[currentStep].instruction);
        } else {
          // 완료
          completeTimer();
        }
      }
    }, 1000);
  }

  function pauseTimer() {
    isRunning = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function resumeTimer() {
    isRunning = true;
    intervalId = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        totalTime--;

        if (timeLeft <= 3 && timeLeft > 0) {
          speak(String(timeLeft));
        }
      } else {
        if (currentStep < brushingSteps.length - 1) {
          currentStep++;
          timeLeft = brushingSteps[currentStep].duration;
          speak(brushingSteps[currentStep].instruction);
        } else {
          completeTimer();
        }
      }
    }, 1000);
  }

  function resetTimer() {
    pauseTimer();
    currentStep = 0;
    timeLeft = 0;
    totalTime = 0;
  }

  function completeTimer() {
    pauseTimer();
    speak('잘했어요! 치카치카 완료!');
  }

  // 음성 초기화 (모바일 브라우저 대응)
  onMount(() => {
    if ('speechSynthesis' in window) {
      // 음성 목록 로드
      const loadVoices = () => {
        voices = speechSynthesis.getVoices();
        speechEnabled = voices.length > 0;
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  });

  // 사용자 인터랙션으로 음성 활성화 (iOS Safari 대응)
  function enableSpeech() {
    if ('speechSynthesis' in window && !speechEnabled) {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      speechSynthesis.speak(utterance);
      speechEnabled = true;
    }
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;

    // 이전 음성 취소
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    // 한국어 음성 찾기
    const koreanVoice = voices.find(v => v.lang.includes('ko'));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    speechSynthesis.speak(utterance);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onDestroy(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    speechSynthesis.cancel();
  });
</script>

<div class="brushing-container">
  <div class="brushing-header">
    <h1>🪥 치카치카 타임!</h1>
    <p>함께 양치해요</p>
  </div>

  {#if !isRunning && totalTime === 0}
    <!-- 시작 화면 -->
    <div class="start-screen">
      <div class="child-selector">
        <h3>누가 양치할까요?</h3>
        <div class="child-buttons">
          {#each children as child}
            <button
              class="child-select-btn"
              class:selected={selectedChild === child.id}
              on:click={() => selectedChild = child.id}
            >
              <span class="child-emoji">{child.profileImage}</span>
              <span class="child-name">{child.name}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="timer-preview">
        <div class="preview-circle">
          <span class="preview-time">{formatTime(totalDuration)}</span>
          <span class="preview-label">총 소요시간</span>
        </div>
      </div>

      <div class="steps-preview">
        <h4>양치 순서</h4>
        <div class="steps-list">
          {#each brushingSteps as step}
            <div class="step-item">
              <span class="step-emoji">{step.emoji}</span>
              <span class="step-name">{step.name}</span>
              <span class="step-duration">{step.duration}초</span>
            </div>
          {/each}
        </div>
      </div>

      <button class="start-btn" on:click={startTimer} disabled={!selectedChild}>
        <span class="btn-icon">▶</span>
        <span class="btn-text">치카치카 시작!</span>
      </button>
    </div>

  {:else}
    <!-- 타이머 화면 -->
    <div class="timer-screen">
      <div class="current-child">
        <span class="child-avatar">{selectedChildData?.profileImage}</span>
        <span class="child-name-display">{selectedChildData?.name}의 양치 시간</span>
      </div>

      <!-- 치아 시각화 -->
      <div class="teeth-visualization">
        <div class="teeth-grid">
          <div class="teeth-row upper">
            <div class="tooth-zone top-left" class:active={currentStepData?.position === 'top-left'}></div>
            <div class="tooth-zone top-right" class:active={currentStepData?.position === 'top-right'}></div>
          </div>
          <div class="mouth-center" class:active={currentStepData?.position === 'center'}>
            <span class="current-emoji">{currentStepData?.emoji}</span>
          </div>
          <div class="teeth-row lower">
            <div class="tooth-zone bottom-left" class:active={currentStepData?.position === 'bottom-left'}></div>
            <div class="tooth-zone bottom-right" class:active={currentStepData?.position === 'bottom-right'}></div>
          </div>
        </div>
      </div>

      <!-- 현재 단계 -->
      <div class="current-step">
        <h2>{currentStepData?.instruction}</h2>
        <span class="step-indicator">
          {currentStep + 1} / {brushingSteps.length} 단계
        </span>
      </div>

      <!-- 타이머 -->
      <div class="timer-display">
        <svg class="timer-ring" viewBox="0 0 200 200">
          <circle
            class="timer-ring-bg"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke-width="12"
          />
          <circle
            class="timer-ring-progress"
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke-width="12"
            stroke-dasharray="565.48"
            stroke-dashoffset={565.48 * (1 - (timeLeft / currentStepData?.duration))}
          />
        </svg>
        <div class="timer-content">
          <span class="timer-seconds">{timeLeft}</span>
          <span class="timer-label">초</span>
        </div>
      </div>

      <!-- 전체 진행률 -->
      <div class="total-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {progressPercent}%"></div>
        </div>
        <span class="progress-text">전체 {Math.round(progressPercent)}% 완료</span>
      </div>

      <!-- 컨트롤 버튼 -->
      <div class="timer-controls">
        {#if isRunning}
          <button class="control-btn pause" on:click={pauseTimer}>
            ⏸ 잠깐 멈춤
          </button>
        {:else}
          <button class="control-btn resume" on:click={resumeTimer}>
            ▶ 계속하기
          </button>
        {/if}
        <button class="control-btn reset" on:click={resetTimer}>
          ↺ 처음부터
        </button>
      </div>
    </div>
  {/if}

  {#if totalTime === 0 && currentStep === brushingSteps.length - 1}
    <!-- 완료 화면 -->
    <div class="complete-screen">
      <div class="complete-animation">
        <span class="complete-emoji">🎉</span>
        <h2>잘했어요!</h2>
        <p>{selectedChildData?.name}, 치카치카 완료!</p>
      </div>
      <div class="reward-section">
        <span class="star">⭐</span>
        <span class="star">⭐</span>
        <span class="star">⭐</span>
      </div>
      <button class="again-btn" on:click={resetTimer}>
        다시 양치하기
      </button>
    </div>
  {/if}
</div>

<style>
  .brushing-container {
    max-width: 480px;
    margin: 0 auto;
    text-align: center;
    padding: 0 var(--space-sm);
  }

  .brushing-header {
    margin-bottom: var(--space-lg);
  }

  .brushing-header h1 {
    font-size: 1.5rem;
    color: var(--primary);
    margin-bottom: var(--space-xs);
  }

  .brushing-header p {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  /* 시작 화면 */
  .start-screen {
    animation: fadeInUp 0.5s ease-out;
  }

  .child-selector {
    margin-bottom: var(--space-lg);
  }

  .child-selector h3 {
    color: var(--navy-700);
    margin-bottom: var(--space-md);
    font-size: 1rem;
  }

  .child-buttons {
    display: flex;
    gap: var(--space-sm);
    justify-content: center;
    flex-wrap: wrap;
  }

  .child-select-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    min-width: 90px;
    min-height: 90px;
    padding: var(--space-md);
    background: white;
    border: 3px solid var(--mint-200);
    border-radius: var(--radius-lg);
    transition: all var(--transition-bounce);
  }

  .child-select-btn:hover {
    border-color: var(--primary);
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }

  .child-select-btn.selected {
    border-color: var(--primary);
    background: var(--mint-50);
    box-shadow: var(--shadow-glow);
  }

  .child-emoji {
    font-size: 2.5rem;
  }

  .child-name {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--navy-700);
  }

  .timer-preview {
    margin-bottom: var(--space-lg);
  }

  .preview-circle {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, var(--mint-100) 0%, var(--mint-50) 100%);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    border: 3px solid var(--mint-200);
  }

  .preview-time {
    font-size: 1.375rem;
    font-weight: 700;
    color: var(--primary);
  }

  .preview-label {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .steps-preview {
    background: white;
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-bottom: var(--space-lg);
    border: 1px solid var(--mint-100);
  }

  .steps-preview h4 {
    color: var(--navy-700);
    margin-bottom: var(--space-sm);
    font-size: 0.9rem;
  }

  .steps-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    justify-content: center;
  }

  .step-item {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--mint-50);
    padding: 4px 8px;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
  }

  .step-emoji {
    font-size: 0.875rem;
  }

  .step-duration {
    color: var(--text-muted);
  }

  .start-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    width: 100%;
    min-height: 64px;
    padding: var(--space-lg);
    background: linear-gradient(135deg, var(--coral-400) 0%, var(--coral-500) 100%);
    color: white;
    border-radius: var(--radius-lg);
    font-size: 1.25rem;
    font-weight: 700;
    transition: all var(--transition-bounce);
    box-shadow: 0 6px 20px rgba(255, 123, 46, 0.4);
  }

  .start-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(255, 123, 46, 0.5);
  }

  .start-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-icon {
    font-size: 1.5rem;
  }

  /* 타이머 화면 */
  .timer-screen {
    animation: fadeInUp 0.5s ease-out;
  }

  .current-child {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }

  .child-avatar {
    font-size: 1.75rem;
    animation: wiggle 1s ease-in-out infinite;
  }

  .child-name-display {
    font-size: 1rem;
    font-weight: 600;
    color: var(--navy-700);
  }

  /* 치아 시각화 */
  .teeth-visualization {
    margin-bottom: var(--space-md);
  }

  .teeth-grid {
    width: 160px;
    margin: 0 auto;
  }

  .teeth-row {
    display: flex;
    justify-content: center;
    gap: var(--space-sm);
  }

  .tooth-zone {
    width: 55px;
    height: 32px;
    background: var(--mint-100);
    border-radius: var(--radius-sm);
    transition: all var(--transition-normal);
  }

  .tooth-zone.active {
    background: linear-gradient(135deg, var(--coral-300) 0%, var(--coral-400) 100%);
    animation: pulse-soft 1s ease-in-out infinite;
    box-shadow: 0 0 15px rgba(249, 115, 22, 0.3);
  }

  .mouth-center {
    width: 70px;
    height: 56px;
    background: var(--mint-50);
    border-radius: 50%;
    margin: var(--space-xs) auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--mint-200);
    transition: all var(--transition-normal);
  }

  .mouth-center.active {
    border-color: var(--coral-400);
    background: var(--coral-50);
  }

  .current-emoji {
    font-size: 2rem;
    animation: float 2s ease-in-out infinite;
  }

  /* 현재 단계 */
  .current-step {
    margin-bottom: var(--space-md);
  }

  .current-step h2 {
    color: var(--navy-800);
    font-size: 1.125rem;
    margin-bottom: var(--space-xs);
  }

  .step-indicator {
    background: var(--mint-100);
    color: var(--primary);
    padding: 4px 12px;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* 타이머 링 */
  .timer-display {
    position: relative;
    width: 150px;
    height: 150px;
    margin: 0 auto var(--space-md);
  }

  .timer-ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .timer-ring-bg {
    stroke: var(--purple-100);
  }

  .timer-ring-progress {
    stroke: var(--cyan-400);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease;
  }

  .timer-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .timer-seconds {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--navy-800);
    line-height: 1;
  }

  .timer-label {
    display: block;
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  /* 전체 진행률 */
  .total-progress {
    margin-bottom: var(--space-md);
  }

  .progress-bar {
    height: 10px;
    background: var(--purple-100);
    border-radius: var(--radius-full);
    overflow: hidden;
    margin-bottom: var(--space-xs);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--cyan-400) 0%, var(--purple-500) 100%);
    border-radius: var(--radius-full);
    transition: width 0.5s ease;
  }

  .progress-text {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  /* 컨트롤 버튼 */
  .timer-controls {
    display: flex;
    gap: var(--space-md);
    justify-content: center;
  }

  .control-btn {
    min-height: 48px;
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 0.9rem;
    transition: all var(--transition-bounce);
  }

  .control-btn.pause {
    background: var(--yellow-400);
    color: var(--navy-800);
    box-shadow: 0 3px 12px rgba(255, 224, 51, 0.4);
  }

  .control-btn.resume {
    background: var(--primary);
    color: white;
    box-shadow: 0 3px 12px rgba(0, 201, 160, 0.4);
  }

  .control-btn.reset {
    background: white;
    color: var(--text-muted);
    border: 2px solid var(--mint-200);
  }

  .control-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  /* 완료 화면 */
  .complete-screen {
    animation: bounceIn 0.8s ease-out;
    padding: var(--space-lg);
  }

  .complete-animation {
    margin-bottom: var(--space-md);
  }

  .complete-emoji {
    font-size: 4rem;
    display: block;
    margin-bottom: var(--space-md);
    animation: float 2s ease-in-out infinite;
  }

  .complete-screen h2 {
    font-size: 1.5rem;
    color: var(--primary);
    margin-bottom: var(--space-sm);
  }

  .complete-screen p {
    font-size: 1.125rem;
    color: var(--navy-700);
  }

  .reward-section {
    margin-bottom: var(--space-lg);
  }

  .star {
    font-size: 2.5rem;
    animation: bounceIn 0.5s ease-out backwards;
    margin: 0 var(--space-xs);
  }

  .star:nth-child(1) { animation-delay: 0.2s; }
  .star:nth-child(2) { animation-delay: 0.4s; }
  .star:nth-child(3) { animation-delay: 0.6s; }

  .again-btn {
    min-height: 52px;
    padding: var(--space-md) var(--space-xl);
    background: var(--primary);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 1rem;
    transition: all var(--transition-bounce);
    box-shadow: var(--shadow-md);
  }

  .again-btn:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }

  @media (max-width: 480px) {
    .child-buttons {
      gap: var(--space-xs);
    }

    .child-select-btn {
      min-width: 80px;
      min-height: 80px;
      padding: var(--space-sm);
    }

    .child-emoji {
      font-size: 2rem;
    }

    .timer-display {
      width: 120px;
      height: 120px;
    }

    .timer-seconds {
      font-size: 2rem;
    }

    .control-btn {
      padding: var(--space-sm) var(--space-md);
      font-size: 0.8rem;
    }
  }
</style>
