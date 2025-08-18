// 공통 상수들

// 색상 테마
export const COLORS = {
  PRIMARY: '#047857',
  PRIMARY_LIGHT: '#e7f5ef',
  SUCCESS: '#10b981',
  ERROR: '#dc2626',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  TEXT_PRIMARY: '#1f2937',
  TEXT_SECONDARY: '#6b7280',
  BORDER: '#e5e7eb',
  BACKGROUND: '#f9fafb'
};

// 이메일 도메인 리스트
export const EMAIL_DOMAINS = [
  'gmail.com',
  'naver.com', 
  'daum.net',
  'kakao.com',
  'icloud.com',
  '직접 입력'
];

// 게시글 카테고리 매핑
export const POST_CATEGORIES = {
  // 한국어 -> 영어
  KOREAN_TO_ENGLISH: {
    '전체': 'general',
    '질문': 'question',
    '일지': 'diary',
    '노하우': 'knowhow',
    '예약': 'reservation' // API 호출시에만 사용
  },
  // 영어 -> 한국어
  ENGLISH_TO_KOREAN: {
    'general': '일반',
    'question': '질문',
    'diary': '일지',
    'knowhow': '노하우',
    'reservation': '예약'
  }
};

// 커뮤니티 탭에서 사용할 카테고리 (예약 제외)
export const COMMUNITY_CATEGORIES = ['전체', '질문', '일지', '노하우'];

// 정렬 옵션 매핑
export const SORT_OPTIONS = {
  KOREAN_TO_ENGLISH: {
    '최신순': 'latest',
    '인기순': 'popular',
    '댓글많은순': 'views'
  },
  ENGLISH_TO_KOREAN: {
    'latest': '최신순',
    'popular': '인기순', 
    'views': '댓글많은순'
  }
};

// 카테고리별 아이콘
export const CATEGORY_ICONS = {
  'question': '❓',
  'diary': '📝',
  'knowhow': '💡',
  'general': '💬',
  'reservation': '📅'
};

// 페이지네이션 기본값
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// API 응답 상태
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading'
};

// 핫 키워드 (임시 - 추후 API로 대체)
export const HOT_KEYWORDS = [
  '기비/추비',
  '관수 주기',
  '러너',
  '병해 사진판독',
  '하우스 환기',
  '탄저병',
  '방제 캘린더',
  '배수',
  '적심',
  '유인'
];

// 인기 카테고리 (임시 - 추후 API로 대체)
export const POPULAR_CATEGORIES = [
  '비료',
  '관수',
  '전정',
  '병해',
  '해충',
  '토양',
  '하우스'
];