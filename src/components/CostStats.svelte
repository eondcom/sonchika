<script>
  import { calculateCostStats } from '../lib/dataStore.js';
  
  export let costs = [];
  export let children = [];
  
  let selectedYear = new Date().getFullYear();
  let selectedChild = '';
  
  $: years = [...new Set(costs.map(c => new Date(c.date).getFullYear()))].sort((a, b) => b - a);
  
  $: stats = calculateCostStats(
    costs, 
    selectedChild || null, 
    selectedYear
  );
  
  $: childrenStats = children.map(child => {
    const childStats = calculateCostStats(costs, child.id, selectedYear);
    return {
      ...child,
      ...childStats
    };
  });
  
  $: monthlyCosts = (() => {
    const filtered = costs.filter(c => {
      const year = new Date(c.date).getFullYear();
      if (selectedChild && c.childId !== selectedChild) return false;
      return year === selectedYear;
    });
    
    const monthly = Array(12).fill(0);
    filtered.forEach(c => {
      const month = new Date(c.date).getMonth();
      monthly[month] += c.amount;
    });
    
    return monthly;
  })();
  
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
</script>

<div class="stats-container">
  <h2>💰 치과 비용 통계</h2>
  
  <div class="filters">
    <div class="filter-group">
      <label>연도</label>
      <select bind:value={selectedYear}>
        {#each years as year}
          <option value={year}>{year}년</option>
        {/each}
      </select>
    </div>
    
    <div class="filter-group">
      <label>아이</label>
      <select bind:value={selectedChild}>
        <option value="">전체</option>
        {#each children as child}
          <option value={child.id}>{child.name}</option>
        {/each}
      </select>
    </div>
  </div>
  
  <div class="summary-cards">
    <div class="summary-card total">
      <div class="card-icon">💳</div>
      <div class="card-content">
        <div class="card-label">총 비용</div>
        <div class="card-value">{stats.total.toLocaleString()}원</div>
      </div>
    </div>
    
    <div class="summary-card count">
      <div class="card-icon">📋</div>
      <div class="card-content">
        <div class="card-label">치료 횟수</div>
        <div class="card-value">{stats.count}회</div>
      </div>
    </div>
    
    <div class="summary-card average">
      <div class="card-icon">📊</div>
      <div class="card-content">
        <div class="card-label">평균 비용</div>
        <div class="card-value">
          {stats.count > 0 ? Math.round(stats.total / stats.count).toLocaleString() : 0}원
        </div>
      </div>
    </div>
  </div>
  
  {#if !selectedChild}
    <div class="children-comparison">
      <h3>아이별 비용</h3>
      <div class="comparison-grid">
        {#each childrenStats as child}
          <div class="child-stat-card">
            <div class="child-icon">{child.profileImage}</div>
            <h4>{child.name}</h4>
            <div class="stat-amount">{child.total.toLocaleString()}원</div>
            <div class="stat-count">{child.count}회 치료</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
  
  <div class="category-breakdown">
    <h3>항목별 비용</h3>
    <div class="category-list">
      {#if Object.keys(stats.byCategory).length === 0}
        <p class="empty-message">비용 기록이 없습니다.</p>
      {:else}
        {#each Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]) as [category, amount]}
          <div class="category-item">
            <div class="category-info">
              <span class="category-name">{category}</span>
              <span class="category-percentage">
                {Math.round((amount / stats.total) * 100)}%
              </span>
            </div>
            <div class="category-bar-container">
              <div 
                class="category-bar" 
                style="width: {(amount / stats.total) * 100}%"
              ></div>
            </div>
            <div class="category-amount">{amount.toLocaleString()}원</div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
  
  <div class="monthly-chart">
    <h3>월별 비용</h3>
    <div class="chart-container">
      {#each monthlyCosts as cost, index}
        <div class="chart-bar">
          <div 
            class="bar-fill" 
            style="height: {Math.max(5, (cost / Math.max(...monthlyCosts)) * 100)}%"
            title="{monthNames[index]}: {cost.toLocaleString()}원"
          >
            {#if cost > 0}
              <span class="bar-value">{(cost / 10000).toFixed(0)}만</span>
            {/if}
          </div>
          <div class="bar-label">{monthNames[index]}</div>
        </div>
      {/each}
    </div>
  </div>
  
  <div class="cost-list">
    <h3>상세 내역</h3>
    {#each costs.filter(c => {
      const year = new Date(c.date).getFullYear();
      if (selectedChild && c.childId !== selectedChild) return false;
      return year === selectedYear;
    }).sort((a, b) => new Date(b.date) - new Date(a.date)) as cost}
      <div class="cost-item">
        <div class="cost-info">
          <span class="cost-child">
            {children.find(c => c.id === cost.childId)?.name}
          </span>
          <span class="cost-date">{cost.date}</span>
          <span class="cost-category">{cost.category}</span>
        </div>
        <div class="cost-desc">{cost.description}</div>
        <div class="cost-amount-large">{cost.amount.toLocaleString()}원</div>
      </div>
    {:else}
      <p class="empty-message">비용 기록이 없습니다.</p>
    {/each}
  </div>
</div>

<style>
  .stats-container {
    max-width: 1000px;
    margin: 0 auto;
  }
  
  h2 {
    color: #667eea;
    margin-bottom: 30px;
  }
  
  h3 {
    color: #333;
    margin: 30px 0 20px 0;
  }
  
  .filters {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9ff;
    border-radius: 12px;
  }
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .filter-group label {
    font-weight: bold;
    color: #333;
  }
  
  .filter-group select {
    padding: 8px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1em;
  }
  
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .summary-card {
    background: white;
    border-radius: 12px;
    padding: 25px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  .summary-card.total {
    border-left: 4px solid #667eea;
  }
  
  .summary-card.count {
    border-left: 4px solid #28a745;
  }
  
  .summary-card.average {
    border-left: 4px solid #ffc107;
  }
  
  .card-icon {
    font-size: 2.5em;
  }
  
  .card-label {
    color: #666;
    font-size: 0.9em;
    margin-bottom: 5px;
  }
  
  .card-value {
    font-size: 1.8em;
    font-weight: bold;
    color: #333;
  }
  
  .children-comparison {
    margin-bottom: 30px;
  }
  
  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .child-stat-card {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
    padding: 25px;
    text-align: center;
  }
  
  .child-icon {
    font-size: 3em;
    margin-bottom: 10px;
  }
  
  .child-stat-card h4 {
    margin: 10px 0;
    color: #333;
  }
  
  .stat-amount {
    font-size: 1.5em;
    font-weight: bold;
    color: #667eea;
    margin: 10px 0 5px 0;
  }
  
  .stat-count {
    color: #666;
    font-size: 0.9em;
  }
  
  .category-breakdown {
    margin-bottom: 30px;
  }
  
  .category-list {
    background: #f8f9ff;
    padding: 25px;
    border-radius: 12px;
  }
  
  .category-item {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .category-item:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .category-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .category-name {
    font-weight: bold;
    color: #333;
  }
  
  .category-percentage {
    color: #667eea;
    font-weight: bold;
  }
  
  .category-bar-container {
    width: 100%;
    height: 12px;
    background: #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  
  .category-bar {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s;
  }
  
  .category-amount {
    text-align: right;
    color: #666;
    font-size: 0.95em;
  }
  
  .monthly-chart {
    margin-bottom: 30px;
  }
  
  .chart-container {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    height: 250px;
    padding: 20px;
    background: #f8f9ff;
    border-radius: 12px;
  }
  
  .chart-bar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
  }
  
  .bar-fill {
    width: 100%;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px 8px 0 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 5px;
    transition: height 0.3s;
    cursor: pointer;
  }
  
  .bar-value {
    color: white;
    font-size: 0.75em;
    font-weight: bold;
  }
  
  .bar-label {
    margin-top: 8px;
    font-size: 0.85em;
    color: #666;
  }
  
  .cost-list {
    margin-bottom: 30px;
  }
  
  .cost-item {
    background: white;
    border: 2px solid #e0e0e0;
    border-left: 4px solid #667eea;
    border-radius: 10px;
    padding: 15px 20px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
  }
  
  .cost-info {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    flex: 1;
  }
  
  .cost-child {
    background: #667eea;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.9em;
    font-weight: bold;
  }
  
  .cost-date {
    color: #666;
  }
  
  .cost-category {
    background: #f0f0f0;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.9em;
  }
  
  .cost-desc {
    color: #555;
    flex: 1;
  }
  
  .cost-amount-large {
    font-size: 1.3em;
    font-weight: bold;
    color: #667eea;
  }
  
  .empty-message {
    text-align: center;
    color: #999;
    padding: 40px;
  }
  
  @media (max-width: 768px) {
    .summary-cards {
      grid-template-columns: 1fr;
    }
    
    .filters {
      flex-direction: column;
    }
    
    .chart-container {
      height: 200px;
      gap: 5px;
      padding: 15px;
    }
    
    .bar-label {
      font-size: 0.7em;
    }
    
    .cost-item {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .cost-amount-large {
      align-self: flex-end;
    }
  }
</style>
