// 손치카 데이터 스토어
import { writable, get } from 'svelte/store';
import initialData from '../data/database.json';

// 전체 데이터베이스
const DB_KEY = 'sonchika_database';

// 데이터베이스 스토어
export const database = writable(null);

// 데이터베이스 초기화
export function initDatabase() {
  const saved = localStorage.getItem(DB_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      database.set(data);
      return data;
    } catch (e) {
      console.error('Database load error:', e);
    }
  }
  // 초기 데이터 사용
  database.set(initialData);
  saveDatabase(initialData);
  return initialData;
}

// 데이터베이스 저장
export function saveDatabase(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  database.set(data);
}

// 사용자별 데이터 가져오기
export function getUserData(userId) {
  const db = get(database);
  if (!db) return null;

  const children = db.children.filter(c => c.userId === userId);
  const childIds = children.map(c => c.id);

  return {
    children: children,
    appointments: db.appointments.filter(a => a.userId === userId),
    treatments: db.treatments.filter(t => t.userId === userId),
    dailyChecks: db.dailyChecks.filter(d => d.userId === userId),
    costs: db.costs.filter(c => c.userId === userId),
    milestones: db.milestones.filter(m => childIds.includes(m.childId))
  };
}

// 자녀 추가
export function addChild(userId, childData) {
  database.update(db => {
    const newChild = {
      id: 'child_' + Date.now(),
      userId: userId,
      ...childData,
      permanentTeethStatus: {
        firstMolar: false,
        lowerIncisors: false
      },
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.children.push(newChild);
    saveDatabase(db);
    return db;
  });
}

// 자녀 수정
export function updateChild(childId, updates) {
  database.update(db => {
    const index = db.children.findIndex(c => c.id === childId);
    if (index !== -1) {
      db.children[index] = { ...db.children[index], ...updates };
      saveDatabase(db);
    }
    return db;
  });
}

// 자녀 삭제
export function deleteChild(childId) {
  database.update(db => {
    db.children = db.children.filter(c => c.id !== childId);
    db.appointments = db.appointments.filter(a => a.childId !== childId);
    db.treatments = db.treatments.filter(t => t.childId !== childId);
    db.costs = db.costs.filter(c => c.childId !== childId);
    db.milestones = db.milestones.filter(m => m.childId !== childId);
    saveDatabase(db);
    return db;
  });
}

// 예약 추가
export function addAppointment(userId, appointmentData) {
  database.update(db => {
    const newAppointment = {
      id: 'apt_' + Date.now(),
      userId: userId,
      ...appointmentData,
      status: 'scheduled',
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.appointments.push(newAppointment);
    saveDatabase(db);
    return db;
  });
}

// 일일 체크 저장
export function saveDailyCheck(userId, date, checkData) {
  database.update(db => {
    const existingIndex = db.dailyChecks.findIndex(
      d => d.userId === userId && d.date === date
    );

    if (existingIndex !== -1) {
      db.dailyChecks[existingIndex].checks = checkData;
    } else {
      db.dailyChecks.push({
        id: 'check_' + Date.now(),
        userId: userId,
        date: date,
        checks: checkData
      });
    }
    saveDatabase(db);
    return db;
  });
}

// 공지사항 가져오기
export function getNotices() {
  const db = get(database);
  return db?.notices?.filter(n => n.status === 'published') || [];
}

// 고객지원 문의 추가
export function addSupportTicket(userId, ticketData) {
  database.update(db => {
    const newTicket = {
      id: 'support_' + Date.now(),
      userId: userId,
      ...ticketData,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      replies: []
    };
    if (!db.support) db.support = [];
    db.support.push(newTicket);
    saveDatabase(db);
    return db;
  });
}

// 사용자 문의 목록
export function getUserTickets(userId) {
  const db = get(database);
  return db?.support?.filter(s => s.userId === userId) || [];
}

// === 관리자 전용 함수 ===

// 전체 사용자 목록
export function getAllUsers() {
  const db = get(database);
  return db?.users?.filter(u => u.role === 'user') || [];
}

// 전체 통계
export function getStatistics() {
  const db = get(database);
  if (!db) return null;

  const users = db.users.filter(u => u.role === 'user');
  const today = new Date().toISOString().split('T')[0];

  return {
    totalUsers: users.length,
    totalChildren: db.children.length,
    totalAppointments: db.appointments.length,
    todayChecks: db.dailyChecks.filter(d => d.date === today).length,
    pendingSupport: (db.support || []).filter(s => s.status === 'pending').length,
    recentUsers: users
      .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin))
      .slice(0, 5)
  };
}

// 공지사항 추가 (관리자)
export function addNotice(noticeData) {
  database.update(db => {
    const newNotice = {
      id: 'notice_' + Date.now(),
      ...noticeData,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'published'
    };
    if (!db.notices) db.notices = [];
    db.notices.push(newNotice);
    saveDatabase(db);
    return db;
  });
}

// 문의 답변 (관리자)
export function replyToTicket(ticketId, replyText) {
  database.update(db => {
    const ticket = db.support?.find(s => s.id === ticketId);
    if (ticket) {
      ticket.replies.push({
        text: replyText,
        createdAt: new Date().toISOString(),
        isAdmin: true
      });
      ticket.status = 'replied';
      saveDatabase(db);
    }
    return db;
  });
}

// 전체 문의 목록 (관리자)
export function getAllTickets() {
  const db = get(database);
  return db?.support || [];
}

// === 유틸리티 함수 ===

// 나이 계산
export function calculateAge(birthDate) {
  if (!birthDate) return 0;
  const [year, month] = birthDate.split('-').map(Number);
  const now = new Date();
  let age = now.getFullYear() - year;
  if (now.getMonth() + 1 < month) {
    age--;
  }
  return age;
}

// 날짜 포맷
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 시간 포맷
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hour, minute] = timeStr.split(':');
  return `${hour}시 ${minute}분`;
}

// 다음 예약일 계산
export function getNextAppointment(appointments, childId) {
  const now = new Date();
  const upcoming = appointments
    .filter(apt => {
      const aptDate = new Date(apt.date);
      return apt.childId === childId && aptDate >= now && apt.status === 'scheduled';
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return upcoming[0] || null;
}

// 비용 통계
export function calculateCostStats(costs, childId = null, year = null) {
  let filtered = costs || [];

  if (childId) {
    filtered = filtered.filter(c => c.childId === childId);
  }

  if (year) {
    filtered = filtered.filter(c => new Date(c.date).getFullYear() === year);
  }

  const total = filtered.reduce((sum, c) => sum + c.amount, 0);
  const byCategory = filtered.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.amount;
    return acc;
  }, {});

  return { total, byCategory, count: filtered.length };
}

// === 레거시 호환 함수 ===

export function loadData() {
  const db = get(database) || initDatabase();
  const firstUser = db.users.find(u => u.role === 'user');
  if (!firstUser) {
    return {
      children: [],
      appointments: [],
      treatments: [],
      dailyChecks: [],
      costs: [],
      milestones: []
    };
  }
  return getUserData(firstUser.id);
}

export function saveData(data) {
  // 레거시 호환
  console.log('saveData called (legacy)');
}

export function exportToJSON() {
  const data = get(database);
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sonchika-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function resetData() {
  localStorage.removeItem(DB_KEY);
  database.set(initialData);
  return initialData;
}
