# 손치카 (Sonchika) 작업 기록

## 사용자 요청 타임라인

### 세션 1 - 프로젝트 초기 설정

#### 요청 1: 프로젝트 기획
> "우리 아이들(해찬, 은찬)을 위한 치아 관리 앱을 만들고 싶어"

**작업 내용:**
- Svelte 5 + Vite 프로젝트 생성
- 앱 이름: 손치카 (Sonchika)
- 대상: 유아 및 부모

#### 요청 2: 데이터 구조 설계
> "어떤 데이터를 관리해야 할까?"

**작업 내용:**
- `database.json` 스키마 설계
- 자녀 정보, 진료 일정, 치료 기록, 일일 체크, 비용, 성장 기록

#### 요청 3: 화면 구성
> "필요한 화면들을 만들어줘"

**작업 내용:**
- 양치 타이머 (BrushingTimer)
- 진료 캘린더 (Calendar)
- 치료 기록 (TreatmentHistory)
- 일일 체크 (DailyCheckList)
- 비용 통계 (CostStats)
- 성장 타임라인 (Timeline)

---

### 세션 2 - 다중 사용자 시스템

#### 요청 4: 로그인 기능
> "여러 사용자가 쓸 수 있게 로그인 기능 추가해줘"

**작업 내용:**
- 카카오 로그인 (Mock)
- 데모 로그인
- 관리자 로그인 (admin@sonchika.com / admin123)
- `auth.js` 인증 모듈 생성

#### 요청 5: 자녀 관리
> "자녀 추가/수정/삭제 기능이 필요해"

**작업 내용:**
- UserApp.svelte에 모달 UI 추가
- `addChild()`, `updateChild()`, `deleteChild()` 함수

---

### 세션 3 - 디자인 개선

#### 요청 6: 유아 친화적 디자인
> "홈택스처럼 글자 크기가 좀더 크고 유아들도 사용할 수 있게끔 터치 영역이 큼직했으면 좋겠어. 디자인은 색상이 좀 더 분명한 파스텔톤으로 해줘."

**작업 내용:**
- 기본 폰트 18px로 증가
- 최소 터치 영역 56px
- 파스텔 색상 적용

#### 요청 7: 색상 테마 변경
> "'참고이미지/64ded3732fb387160160.jpg' 이미지 참고해서 색상이 좀 더 분명하면 좋겠어 지금 너무 흐릿해"

**작업 내용:**
- 2080 주니어 치약 패키지 색상 적용
- 퍼플블루 (#4B5BA6) + 시안 (#00E6D6)
- 전체 컴포넌트 색상 업데이트

---

### 세션 4 - 배포 및 버그 수정 (2026-01-21)

#### 요청 8: 배포 문의
> "웹서버에 올릴려는데 어떤 파일 올리면 돼?"

**작업 내용:**
- `npm run build` 실행
- `dist/` 폴더 설명

#### 요청 9: 모바일 문제 수정
> "실제 브라우저에 올렸는데 음성 소리가 안나더라? 그리고, 화면 글자가 너무 커서 화면에 정확하게 잘 안맞고 글자가 세로로 정렬되어져보이더라. 그런 부분 수정 정리해주면 좋겠어. UXUI 면에서 모바일에서 깔끔하게 보이도록 해줘."

**작업 내용:**

1. **음성 재생 문제 해결**
   - iOS Safari 음성 API 활성화 코드 추가
   - 한국어 음성 자동 선택
   - `enableSpeech()` 함수로 사용자 인터랙션 처리

2. **레이아웃 최적화**
   | 항목 | 이전 | 수정 후 |
   |------|------|---------|
   | 기본 폰트 | 18px | 16px |
   | 버튼 최소 높이 | 56px | 44px |
   | h1 | 2.5rem | 1.75rem |
   | h2 | 1.875rem | 1.375rem |

3. **모바일 반응형**
   - 480px 이하: 글자 14px
   - 768px 이하: 글자 15px

**수정된 파일:**
- `src/app.css`
- `src/components/BrushingTimer.svelte`
- `src/components/Login.svelte`
- `src/components/UserApp.svelte`

#### 요청 10: 작업 기록 저장
> "작업기록 혹시 저장 가능하니"
> "현재까지의 작업 히스토리를 알고 싶은데, 구체적으로 내가 요청한 사항을 시간 타임별로 기록해줄 수 있니?"

**작업 내용:**
- `CHANGELOG.md` 파일 생성
- 요청별 타임라인 정리

---

## 기술 스택

- **Frontend**: Svelte 5 + Vite
- **Storage**: localStorage (JSON)
- **Styling**: CSS Custom Properties
- **음성**: Web Speech API (speechSynthesis)

## 파일 구조

```
src/
├── App.svelte              # 인증 라우터
├── app.css                 # 전역 스타일
├── components/
│   ├── Login.svelte        # 로그인 화면
│   ├── UserApp.svelte      # 사용자 대시보드
│   ├── AdminDashboard.svelte
│   ├── BrushingTimer.svelte # 양치 타이머
│   ├── Calendar.svelte
│   ├── TreatmentHistory.svelte
│   ├── DailyCheckList.svelte
│   ├── CostStats.svelte
│   ├── Timeline.svelte
│   └── ChildProfile.svelte
├── lib/
│   ├── auth.js             # 인증 관리
│   └── dataStore.js        # 데이터 관리
└── data/
    └── database.json       # 초기 데이터
```

## 배포 방법

```bash
# 빌드
npm run build

# dist 폴더 업로드
dist/
├── index.html
├── vite.svg
└── assets/
    ├── index-*.css
    └── index-*.js
```

### Apache .htaccess (SPA 라우팅)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 계정 정보

- **데모**: 버튼 클릭으로 바로 접속
- **관리자**: admin@sonchika.com / admin123
