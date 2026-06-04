<script>
  export let milestones = [];
  export let children = [];
  
  let selectedChild = '';
  
  $: filteredMilestones = selectedChild
    ? milestones.filter(m => m.childId === selectedChild)
    : milestones;
  
  $: sortedMilestones = [...filteredMilestones].sort((a, b) => a.year - b.year);
  
  const currentYear = new Date().getFullYear();
</script>

<div class="timeline-container">
  <h2>🗓️ 생애주기 타임라인</h2>
  <p class="subtitle">아이들의 치과 관리 로드맵을 확인하세요</p>
  
  <div class="filter-section">
    <label>아이 선택:</label>
    <select bind:value={selectedChild}>
      <option value="">전체</option>
      {#each children as child}
        <option value={child.id}>{child.name}</option>
      {/each}
    </select>
  </div>
  
  <div class="timeline">
    {#each sortedMilestones as milestone, index}
      {@const child = children.find(c => c.id === milestone.childId)}
      {@const isPast = milestone.year < currentYear}
      {@const isCurrent = milestone.year === currentYear}
      {@const isFuture = milestone.year > currentYear}
      
      <div 
        class="milestone" 
        class:past={isPast}
        class:current={isCurrent}
        class:future={isFuture}
      >
        <div class="milestone-marker">
          <div class="marker-dot"></div>
          {#if index < sortedMilestones.length - 1}
            <div class="marker-line"></div>
          {/if}
        </div>
        
        <div class="milestone-content">
          <div class="milestone-header">
            <span class="child-badge">{child?.profileImage} {child?.name}</span>
            <span class="year-badge">{milestone.year}년</span>
            <span class="age-badge">만 {milestone.age}세</span>
          </div>
          
          <div class="milestone-events">
            {#each milestone.events as event}
              <div class="event-item">
                <span class="event-icon">
                  {#if event.includes('영구치')}
                    🦷
                  {:else if event.includes('실란트')}
                    🛡️
                  {:else if event.includes('교정')}
                    😁
                  {:else if event.includes('스케일링')}
                    ✨
                  {:else}
                    📌
                  {/if}
                </span>
                <span class="event-text">{event}</span>
              </div>
            {/each}
          </div>
          
          {#if isCurrent}
            <div class="current-badge-container">
              <span class="current-year-badge">🎯 올해</span>
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
  
  <div class="legend-section">
    <h3>📖 주요 이정표 설명</h3>
    <div class="legend-grid">
      <div class="legend-item">
        <div class="legend-icon">🦷</div>
        <div class="legend-content">
          <strong>영구치 맹출</strong>
          <p>제1대구치(6-7세), 제2대구치(12세) 등 영구치가 나오는 시기</p>
        </div>
      </div>
      
      <div class="legend-item">
        <div class="legend-icon">🛡️</div>
        <div class="legend-content">
          <strong>실란트 시술</strong>
          <p>영구치 어금니 홈을 메워 충치 예방 (보험 적용)</p>
        </div>
      </div>
      
      <div class="legend-item">
        <div class="legend-icon">😁</div>
        <div class="legend-content">
          <strong>교정 골든타임</strong>
          <p>치아 교정의 최적 시기 (10-13세)</p>
        </div>
      </div>
      
      <div class="legend-item">
        <div class="legend-icon">✨</div>
        <div class="legend-content">
          <strong>스케일링 시작</strong>
          <p>영구치 관리를 위한 정기 스케일링 시작</p>
        </div>
      </div>
    </div>
  </div>
  
  <div class="tips-section">
    <h3>💡 시기별 관리 포인트</h3>
    <div class="tips-grid">
      <div class="tip-card">
        <h4>🍼 유치기 (0-6세)</h4>
        <ul>
          <li>첫 치아 나면 치과 첫 방문</li>
          <li>불소도포 정기적으로</li>
          <li>간식 조절 중요</li>
          <li>양치 습관 형성</li>
        </ul>
      </div>
      
      <div class="tip-card">
        <h4>🦷 혼합치열기 (6-12세)</h4>
        <ul>
          <li>영구치 맹출 시 실란트</li>
          <li>유치 관리 지속</li>
          <li>치실 사용 시작</li>
          <li>정기 검진 3-6개월</li>
        </ul>
      </div>
      
      <div class="tip-card">
        <h4>😁 영구치기 (12세 이상)</h4>
        <ul>
          <li>스케일링 연 1-2회</li>
          <li>교정 필요 시 상담</li>
          <li>사랑니 관리 시작</li>
          <li>자가 관리 습관화</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
  .timeline-container {
    max-width: 900px;
    margin: 0 auto;
  }
  
  h2 {
    color: #667eea;
    margin-bottom: 10px;
  }
  
  .subtitle {
    color: #666;
    margin-bottom: 30px;
  }
  
  h3 {
    color: #333;
    margin: 40px 0 20px 0;
  }
  
  .filter-section {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 30px;
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
  
  .timeline {
    position: relative;
    padding: 20px 0;
  }
  
  .milestone {
    display: flex;
    gap: 30px;
    margin-bottom: 40px;
    position: relative;
  }
  
  .milestone:last-child {
    margin-bottom: 0;
  }
  
  .milestone-marker {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .marker-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #e0e0e0;
    border: 4px solid white;
    box-shadow: 0 0 0 2px #e0e0e0;
    z-index: 2;
    transition: all 0.3s;
  }
  
  .milestone.past .marker-dot {
    background: #28a745;
    box-shadow: 0 0 0 2px #28a745;
  }
  
  .milestone.current .marker-dot {
    background: #667eea;
    box-shadow: 0 0 0 2px #667eea;
    animation: pulse 2s infinite;
  }
  
  .milestone.future .marker-dot {
    background: #ffc107;
    box-shadow: 0 0 0 2px #ffc107;
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.8;
    }
  }
  
  .marker-line {
    width: 3px;
    flex: 1;
    background: #e0e0e0;
    margin-top: 10px;
    min-height: 60px;
  }
  
  .milestone.past .marker-line {
    background: #28a745;
  }
  
  .milestone.current .marker-line {
    background: linear-gradient(180deg, #667eea 0%, #e0e0e0 100%);
  }
  
  .milestone-content {
    flex: 1;
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 20px;
    position: relative;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transition: all 0.3s;
  }
  
  .milestone-content:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    transform: translateX(5px);
  }
  
  .milestone.past .milestone-content {
    border-left: 4px solid #28a745;
  }
  
  .milestone.current .milestone-content {
    border-left: 4px solid #667eea;
    background: #f8f9ff;
  }
  
  .milestone.future .milestone-content {
    border-left: 4px solid #ffc107;
  }
  
  .milestone-header {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }
  
  .child-badge {
    background: #667eea;
    color: white;
    padding: 6px 14px;
    border-radius: 15px;
    font-size: 0.95em;
    font-weight: bold;
  }
  
  .year-badge {
    background: #333;
    color: white;
    padding: 6px 14px;
    border-radius: 15px;
    font-size: 0.95em;
    font-weight: bold;
  }
  
  .age-badge {
    background: #f0f0f0;
    color: #333;
    padding: 6px 14px;
    border-radius: 15px;
    font-size: 0.95em;
  }
  
  .milestone-events {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .event-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: rgba(102, 126, 234, 0.05);
    border-radius: 8px;
  }
  
  .event-icon {
    font-size: 1.5em;
  }
  
  .event-text {
    color: #333;
    line-height: 1.5;
  }
  
  .current-badge-container {
    margin-top: 15px;
    text-align: right;
  }
  
  .current-year-badge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9em;
    font-weight: bold;
    display: inline-block;
  }
  
  .legend-section {
    background: #f8f9ff;
    padding: 25px;
    border-radius: 15px;
    margin-top: 40px;
  }
  
  .legend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .legend-item {
    display: flex;
    gap: 15px;
    align-items: flex-start;
  }
  
  .legend-icon {
    font-size: 2em;
    flex-shrink: 0;
  }
  
  .legend-content strong {
    display: block;
    color: #333;
    margin-bottom: 5px;
  }
  
  .legend-content p {
    margin: 0;
    color: #666;
    font-size: 0.9em;
    line-height: 1.5;
  }
  
  .tips-section {
    background: #fff3cd;
    padding: 25px;
    border-radius: 15px;
    border-left: 4px solid #ffc107;
    margin-top: 40px;
  }
  
  .tips-section h3 {
    margin-top: 0;
    color: #856404;
  }
  
  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .tip-card {
    background: white;
    padding: 20px;
    border-radius: 10px;
    border: 2px solid #ffc107;
  }
  
  .tip-card h4 {
    margin: 0 0 15px 0;
    color: #856404;
  }
  
  .tip-card ul {
    margin: 0;
    padding-left: 20px;
  }
  
  .tip-card li {
    margin-bottom: 8px;
    color: #856404;
    line-height: 1.5;
  }
  
  @media (max-width: 768px) {
    .milestone {
      gap: 20px;
    }
    
    .milestone-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .legend-grid, .tips-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
