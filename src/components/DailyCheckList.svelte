<script>
  import { createEventDispatcher } from 'svelte';

  export let dailyChecks = [];
  export let children = [];

  const dispatch = createEventDispatcher();

  const today = new Date().toISOString().split('T')[0];

  $: todayCheck = dailyChecks.find(check => check.date === today) || {
    date: today,
    checks: children.reduce((acc, child) => {
      acc[child.id] = {
        morning: { brush: false, floss: false },
        night: { brush: false, floss: false }
      };
      return acc;
    }, {})
  };

  function toggleCheck(childId, time, type) {
    const checkIndex = dailyChecks.findIndex(check => check.date === today);

    if (checkIndex === -1) {
      const newCheck = {
        date: today,
        checks: children.reduce((acc, child) => {
          acc[child.id] = {
            morning: { brush: false, floss: false },
            night: { brush: false, floss: false }
          };
          return acc;
        }, {})
      };
      newCheck.checks[childId][time][type] = true;
      dailyChecks = [...dailyChecks, newCheck];
    } else {
      const updated = [...dailyChecks];
      if (!updated[checkIndex].checks[childId]) {
        updated[checkIndex].checks[childId] = {
          morning: { brush: false, floss: false },
          night: { brush: false, floss: false }
        };
      }
      updated[checkIndex].checks[childId][time][type] =
        !updated[checkIndex].checks[childId][time][type];
      dailyChecks = updated;
    }

    dispatch('update');
  }

  function getWeekData() {
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayCheck = dailyChecks.find(check => check.date === dateStr);
      week.push({
        date: dateStr,
        day: date.toLocaleDateString('ko-KR', { weekday: 'short' }),
        dayNum: date.getDate(),
        checks: dayCheck?.checks || {}
      });
    }
    return week;
  }

  function calculateCompletion(checks) {
    if (!checks || Object.keys(checks).length === 0) return 0;
    const total = Object.keys(checks).length * 4;
    let completed = 0;
    Object.values(checks).forEach(child => {
      if (child?.morning?.brush) completed++;
      if (child?.morning?.floss) completed++;
      if (child?.night?.brush) completed++;
      if (child?.night?.floss) completed++;
    });
    return Math.round((completed / total) * 100);
  }

  function getTodayCompletion(childId) {
    const childChecks = todayCheck.checks[childId];
    if (!childChecks) return 0;
    let completed = 0;
    if (childChecks.morning?.brush) completed++;
    if (childChecks.morning?.floss) completed++;
    if (childChecks.night?.brush) completed++;
    if (childChecks.night?.floss) completed++;
    return (completed / 4) * 100;
  }

  $: weekData = getWeekData();
</script>

<div class="daily-container">
  <header class="page-header">
    <div class="header-content">
      <h1>✅ 일일 체크</h1>
      <p class="subtitle">매일 양치와 치실 사용을 체크해요</p>
    </div>
    <div class="today-badge">
      <span class="badge-day">{new Date().toLocaleDateString('ko-KR', { weekday: 'short' })}</span>
      <span class="badge-date">{new Date().getDate()}</span>
    </div>
  </header>

  <!-- 오늘 체크 -->
  <section class="today-section">
    {#each children as child, i}
      <div class="child-check-card animate-fade-in" style="animation-delay: {i * 100}ms">
        <div class="card-header">
          <div class="child-info">
            <span class="child-avatar">{child.profileImage}</span>
            <h3>{child.name}</h3>
          </div>
          <div class="completion-ring">
            <svg viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="var(--mint-100)"
                stroke-width="3"
              />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="var(--primary)"
                stroke-width="3"
                stroke-dasharray="100"
                stroke-dashoffset={100 - getTodayCompletion(child.id)}
                stroke-linecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <span class="completion-text">{Math.round(getTodayCompletion(child.id))}%</span>
          </div>
        </div>

        <div class="time-grid">
          <!-- 아침 -->
          <div class="time-block morning">
            <div class="time-header">
              <span class="time-icon">🌅</span>
              <span class="time-label">아침</span>
            </div>
            <div class="check-buttons">
              <button
                class="check-btn"
                class:checked={todayCheck.checks[child.id]?.morning?.brush}
                on:click={() => toggleCheck(child.id, 'morning', 'brush')}
              >
                <span class="check-icon">🪥</span>
                <span class="check-label">양치</span>
                {#if todayCheck.checks[child.id]?.morning?.brush}
                  <span class="check-mark">✓</span>
                {/if}
              </button>
              <button
                class="check-btn"
                class:checked={todayCheck.checks[child.id]?.morning?.floss}
                on:click={() => toggleCheck(child.id, 'morning', 'floss')}
              >
                <span class="check-icon">🧵</span>
                <span class="check-label">치실</span>
                {#if todayCheck.checks[child.id]?.morning?.floss}
                  <span class="check-mark">✓</span>
                {/if}
              </button>
            </div>
          </div>

          <!-- 저녁 -->
          <div class="time-block night">
            <div class="time-header">
              <span class="time-icon">🌙</span>
              <span class="time-label">저녁</span>
            </div>
            <div class="check-buttons">
              <button
                class="check-btn"
                class:checked={todayCheck.checks[child.id]?.night?.brush}
                on:click={() => toggleCheck(child.id, 'night', 'brush')}
              >
                <span class="check-icon">🪥</span>
                <span class="check-label">양치</span>
                {#if todayCheck.checks[child.id]?.night?.brush}
                  <span class="check-mark">✓</span>
                {/if}
              </button>
              <button
                class="check-btn"
                class:checked={todayCheck.checks[child.id]?.night?.floss}
                on:click={() => toggleCheck(child.id, 'night', 'floss')}
              >
                <span class="check-icon">🧵</span>
                <span class="check-label">치실</span>
                {#if todayCheck.checks[child.id]?.night?.floss}
                  <span class="check-mark">✓</span>
                {/if}
              </button>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </section>

  <!-- 주간 기록 -->
  <section class="week-section">
    <h2>📊 이번 주 기록</h2>
    <div class="week-calendar">
      {#each weekData as day}
        <div class="day-cell" class:today={day.date === today}>
          <span class="day-name">{day.day}</span>
          <span class="day-num">{day.dayNum}</span>
          <div class="day-progress">
            <div
              class="day-progress-fill"
              style="height: {calculateCompletion(day.checks)}%"
            ></div>
          </div>
          <span class="day-percent">{calculateCompletion(day.checks)}%</span>
        </div>
      {/each}
    </div>
  </section>

  <!-- 팁 섹션 -->
  <section class="tips-section">
    <div class="tip-card">
      <span class="tip-icon">💡</span>
      <div class="tip-content">
        <h4>오늘의 팁</h4>
        <p>치실에 치약을 묻혀서 사용하면 불소 효과가 더 좋아요!</p>
      </div>
    </div>
  </section>
</div>

<style>
  .daily-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2xl);
  }

  .header-content h1 {
    color: var(--navy-800);
    margin-bottom: var(--space-xs);
  }

  .subtitle {
    color: var(--text-muted);
  }

  .today-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(135deg, var(--coral-400) 0%, var(--coral-500) 100%);
    color: white;
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-lg);
    min-width: 60px;
  }

  .badge-day {
    font-size: 0.75rem;
    opacity: 0.9;
  }

  .badge-date {
    font-size: 1.5rem;
    font-weight: 800;
  }

  /* 오늘 체크 섹션 */
  .today-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    margin-bottom: var(--space-2xl);
  }

  .child-check-card {
    background: white;
    border-radius: var(--radius-xl);
    padding: var(--space-xl);
    border: 1px solid var(--mint-100);
    transition: all var(--transition-normal);
  }

  .child-check-card:hover {
    box-shadow: var(--shadow-md);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xl);
  }

  .child-info {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .child-avatar {
    font-size: 2.5rem;
  }

  .child-info h3 {
    color: var(--navy-800);
    font-size: 1.25rem;
  }

  .completion-ring {
    position: relative;
    width: 50px;
    height: 50px;
  }

  .completion-ring svg {
    width: 100%;
    height: 100%;
  }

  .completion-ring circle:last-child {
    transition: stroke-dashoffset var(--transition-slow);
  }

  .completion-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--primary);
  }

  .time-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }

  .time-block {
    background: var(--mint-50);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
  }

  .time-block.night {
    background: var(--navy-50);
  }

  .time-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }

  .time-icon {
    font-size: 1.25rem;
  }

  .time-label {
    font-weight: 600;
    color: var(--navy-700);
  }

  .check-buttons {
    display: flex;
    gap: var(--space-sm);
  }

  .check-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-md);
    background: white;
    border: 2px solid var(--mint-200);
    border-radius: var(--radius-md);
    transition: all var(--transition-bounce);
    position: relative;
  }

  .check-btn:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }

  .check-btn.checked {
    background: linear-gradient(135deg, var(--mint-100) 0%, var(--mint-200) 100%);
    border-color: var(--primary);
  }

  .check-icon {
    font-size: 1.5rem;
  }

  .check-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--navy-600);
  }

  .check-mark {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: var(--primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    animation: bounceIn 0.3s ease-out;
  }

  /* 주간 기록 */
  .week-section {
    margin-bottom: var(--space-2xl);
  }

  .week-section h2 {
    color: var(--navy-800);
    margin-bottom: var(--space-lg);
  }

  .week-calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--space-sm);
    background: white;
    padding: var(--space-lg);
    border-radius: var(--radius-xl);
    border: 1px solid var(--mint-100);
  }

  .day-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    transition: all var(--transition-normal);
  }

  .day-cell.today {
    background: var(--mint-50);
    border: 2px solid var(--primary);
  }

  .day-name {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .day-num {
    font-weight: 700;
    color: var(--navy-700);
  }

  .day-cell.today .day-num {
    color: var(--primary);
  }

  .day-progress {
    width: 24px;
    height: 40px;
    background: var(--mint-100);
    border-radius: var(--radius-sm);
    overflow: hidden;
    position: relative;
  }

  .day-progress-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, var(--primary) 0%, var(--mint-400) 100%);
    transition: height var(--transition-slow);
    border-radius: var(--radius-sm);
  }

  .day-percent {
    font-size: 0.7rem;
    color: var(--text-muted);
    font-weight: 600;
  }

  /* 팁 섹션 */
  .tips-section {
    margin-bottom: var(--space-xl);
  }

  .tip-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    background: linear-gradient(135deg, var(--yellow-300) 0%, var(--yellow-400) 100%);
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
  }

  .tip-icon {
    font-size: 2rem;
  }

  .tip-content h4 {
    color: var(--navy-800);
    margin-bottom: var(--space-xs);
  }

  .tip-content p {
    color: var(--navy-700);
    font-size: 0.95rem;
  }

  @media (max-width: 600px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-md);
    }

    .time-grid {
      grid-template-columns: 1fr;
    }

    .week-calendar {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
