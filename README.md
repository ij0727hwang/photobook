# MyPhotoBook

> 사진을 업로드하면 아름다운 포토북으로 제작해주는 웹 애플리케이션

## 서비스 소개

**MyPhotoBook**은 사용자가 사진을 업로드하면 SweetBook Book Print API를 통해 실물 포토북으로 제작·주문할 수 있는 웹 서비스입니다.

### 타겟 고객
- 여행, 일상, 가족 사진을 포토북으로 만들고 싶은 20~40대
- 복잡한 편집 없이 사진만 올려서 포토북을 만들고 싶은 사람

### 주요 기능
- 📐 **3가지 판형 선택** — A4 소프트커버, A5 소프트커버, 스퀘어 하드커버
- 🎨 **전문 템플릿** — 구글포토북 A/B/C 테마 템플릿 자동 적용
- 📷 **드래그&드롭 사진 업로드** — 사진을 끌어다 놓으면 자동 배치
- 📖 **표지 정보 입력** — 포토북 제목, 저자 설정
- 👁️ **미리보기** — 업로드 전 설정 확인
- 🛒 **원클릭 포토북 생성** — 사진 업로드 → 표지 → 내지 → 최종화까지 자동
- 💰 **견적 조회 & 주문** — 가격 확인 후 배송 정보 입력하여 주문
- 📦 **주문 관리** — 주문 목록, 상세 조회, 주문 취소 지원
- 📍 **주문 상태 추적** — 결제완료 → 제작 → 배송까지 타임라인 UI

## 실행 방법

### 사전 요구사항
- Node.js 18 이상
- SweetBook Sandbox API Key ([api.sweetbook.com](https://api.sweetbook.com) 에서 발급)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/YOUR_USERNAME/myphotobook.git
cd myphotobook

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.example .env
# .env 파일을 열어 API Key를 입력하세요:
# SWEETBOOK_API_KEY=your_sandbox_api_key_here

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속하세요.

### 더미 데이터
`public/dummy/` 폴더에 6장의 예시 사진이 포함되어 있습니다. 포토북 제작 시 이 사진들을 사용하거나 직접 사진을 업로드할 수 있습니다.

## 사용한 API 목록

| API | 용도 |
|-----|------|
| `GET /book-specs` | 판형 목록 조회 (A4, A5, 스퀘어) |
| `GET /templates` | 판형에 맞는 표지/내지 템플릿 조회 |
| `GET /templates/{templateUid}` | 템플릿 상세 조회 (파라미터 확인) |
| `POST /books` | 새 포토북 생성 (draft 상태) |
| `GET /books` | 포토북 목록 조회 |
| `POST /books/{bookUid}/photos` | 사진 업로드 |
| `POST /books/{bookUid}/cover` | 표지 추가 (템플릿 + 파라미터) |
| `POST /books/{bookUid}/contents` | 내지 페이지 추가 (갤러리 템플릿) |
| `POST /books/{bookUid}/finalization` | 포토북 최종화 |
| `POST /orders/estimate` | 주문 견적 조회 |
| `POST /orders` | 주문 생성 (충전금 차감) |
| `GET /orders` | 주문 목록 조회 |
| `GET /orders/{orderUid}` | 주문 상세 조회 |
| `POST /orders/{orderUid}/cancel` | 주문 취소 (환불) |
| `GET /credits` | 충전금 잔액 조회 |

## AI 도구 사용 내역

| AI 도구 | 활용 내용 |
|---------|----------|
| Gemini (Antigravity) | 전체 프로젝트 아키텍처 설계 및 풀스택 코드 구현 |
| Gemini (Antigravity) | SweetBook API 문서 분석 및 연동 코드 작성 |
| Gemini (Antigravity) | 프리미엄 다크 테마 UI/UX 디자인 시스템 구축 |
| Gemini (Image Gen) | 더미 데이터용 예시 사진 6장 생성 |
| Gemini (Antigravity) | README.md 작성 |

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 14 (App Router), React 18 |
| 백엔드 | Next.js API Routes (서버사이드 프록시) |
| 스타일링 | Vanilla CSS (CSS Modules) |
| API 연동 | SweetBook Book Print API (직접 호출) |
| 상태관리 | React useState/useEffect |

## 프로젝트 구조

```
src/
├── app/
│   ├── api/                    # 백엔드 API Routes (SweetBook 프록시)
│   │   ├── book-specs/         # 판형 조회
│   │   ├── books/              # 책 CRUD, 사진, 표지, 내지, 최종화
│   │   ├── credits/            # 충전금 조회
│   │   ├── orders/             # 주문 CRUD, 견적, 취소
│   │   └── templates/          # 템플릿 조회
│   ├── create/                 # 포토북 생성 위저드 (6단계)
│   ├── orders/                 # 주문 목록 & 상세
│   ├── globals.css             # 디자인 시스템
│   ├── layout.js               # 루트 레이아웃
│   └── page.js                 # 랜딩 페이지
├── components/
│   ├── Header.js               # 글로벌 네비게이션
│   └── Header.module.css
├── lib/
│   └── sweetbook.js            # SweetBook API 클라이언트
public/
└── dummy/                      # 예시 사진 (더미 데이터)
```

## 설계 의도

### 왜 이 서비스를 선택했는가?
포토북은 디지털 사진을 실물로 만들 수 있는 가장 감성적인 방법입니다. 기존 포토북 서비스들은 복잡한 편집 도구를 요구하지만, MyPhotoBook은 "사진만 올리면 끝"이라는 심플한 경험을 제공합니다.

### 비즈니스 가능성
- **B2C 포토북 서비스**: 일반 소비자 대상 포토북 제작 서비스
- **B2B 화이트라벨**: 여행사, 유치원, 웨딩 업체 등에 포토북 기능 탑재
- **구독 모델**: 월간/연간 포토북 자동 제작 (SNS 연동)

### 더 시간이 있었다면 추가했을 기능
- 사진 순서 드래그&드롭 재배치
- 포토북 미리보기 (페이지별 렌더링)
- 사용자 인증 (로그인/회원가입)
- 다중 수량 주문 지원
- 웹훅 연동으로 실시간 주문 상태 업데이트
- 사진 필터/보정 기능
- 다국어 지원 (영어, 일본어)