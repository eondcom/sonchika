// 손치카 인증 시스템 (Mock - JSON 기반)
import { writable, derived } from 'svelte/store';

// 현재 사용자 상태
export const currentUser = writable(null);
export const isAuthenticated = derived(currentUser, $user => $user !== null);
export const isAdmin = derived(currentUser, $user => $user?.role === 'admin');

// 로컬스토리지 키
const AUTH_KEY = 'sonchika_auth';

// 초기화 - 저장된 세션 복원
export function initAuth() {
  const saved = localStorage.getItem(AUTH_KEY);
  if (saved) {
    try {
      const user = JSON.parse(saved);
      currentUser.set(user);
      return user;
    } catch (e) {
      localStorage.removeItem(AUTH_KEY);
    }
  }
  return null;
}

// 카카오 로그인 (Mock)
export async function loginWithKakao() {
  // 실제로는 카카오 SDK 사용
  // 여기서는 Mock 데이터로 시뮬레이션
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock 카카오 사용자 정보
      const kakaoUser = {
        id: 'kakao_' + Date.now(),
        nickname: '카카오사용자',
        email: 'user@kakao.com',
        profileImage: '👤'
      };
      resolve(kakaoUser);
    }, 500);
  });
}

// 로그인 처리
export async function login(kakaoData, database) {
  // 기존 사용자 찾기
  let user = database.users.find(u => u.kakaoId === kakaoData.id);

  if (!user) {
    // 신규 사용자 생성
    user = {
      id: 'user_' + Date.now(),
      kakaoId: kakaoData.id,
      email: kakaoData.email,
      name: kakaoData.nickname,
      nickname: kakaoData.nickname,
      role: 'user',
      profileImage: kakaoData.profileImage || '👤',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
      status: 'active',
      loginCount: 1,
      settings: {
        notifications: {
          morning: { enabled: true, time: '07:00' },
          night: { enabled: true, time: '20:00' },
          appointment: true
        }
      }
    };
    database.users.push(user);
  } else {
    // 기존 사용자 로그인 업데이트
    user.lastLogin = new Date().toISOString().split('T')[0];
    user.loginCount = (user.loginCount || 0) + 1;
  }

  // 세션 저장
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  currentUser.set(user);

  return user;
}

// 관리자 로그인 (이메일/비밀번호)
export async function loginAsAdmin(email, password) {
  // Mock: admin@sonchika.com / admin123
  if (email === 'admin@sonchika.com' && password === 'admin123') {
    const adminUser = {
      id: 'admin001',
      email: email,
      name: '관리자',
      role: 'admin',
      profileImage: '👨‍💼',
      lastLogin: new Date().toISOString().split('T')[0]
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(adminUser));
    currentUser.set(adminUser);

    return adminUser;
  }

  throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
}

// 로그아웃
export function logout() {
  localStorage.removeItem(AUTH_KEY);
  currentUser.set(null);
}

// 사용자 프로필 업데이트
export function updateProfile(updates) {
  currentUser.update(user => {
    if (!user) return null;
    const updated = { ...user, ...updates };
    localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    return updated;
  });
}

// 데모 로그인 (테스트용)
export function demoLogin(database) {
  const demoUser = database.users.find(u => u.id === 'user001');
  if (demoUser) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(demoUser));
    currentUser.set(demoUser);
    return demoUser;
  }
  return null;
}
