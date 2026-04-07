# MyPhotoBook (Squarebook Edition)

> 스퀘어 하드커버 포토북을 간편하게 제작하고 주문할 수 있는 프리미엄 웹 애플리케이션

## 서비스 소개

**MyPhotoBook**은 사용자가 사진을 업로드하면 고품질 스퀘어 하드커버 포토북으로 자동 구성하여, SweetBook Book Print API를 통해 실제 상품으로 제작 및 주문할 수 있는 웹 서비스입니다. 

기존의 복잡한 편집 과정을 생략하고, "사진만 올리면 알아서 만들어주는" 직관적이고 심플한 워크플로우를 제공합니다.

### 타겟 고객
- 여행, 일상, 가족, 반려동물(Puppy Log) 사진을 고급스러운 스퀘어 포토북으로 남기고 싶은 분
- 복잡한 편집 없이 빠르고 간편하게 포토북을 제작하고 싶은 사용자

### 주요 기능
- 📐 **단일 규격 최적화** — 스퀘어 하드커버(Square Hardcover) 규격에 특화된 유려한 디자인
- 📄 **유연한 페이지 설정** — 24페이지부터 최대 130페이지까지 원하는 분량의 포토북 제작 가능
- 🎨 **자동 레이아웃** — 표지와 내지 사진을 업로드하면 템플릿에 맞추어 자동으로 사진 분배 및 배치
- 📷 **직관적인 사진 업로드** — 로딩 상태와 진행률을 명확히 보여주는 깔끔한 업로드 UI
- 📖 **간편한 메타데이터 입력** — 포토북 제목, 저자 정보 등을 손쉽게 설정
- 🛒 **원클릭 포토북 생성** — 책 생성 → 사진 업로드 → 표지/내지 구성 → 최종화까지 자동화된 파이프라인
- 💰 **견적 및 주문** — 완성된 포토북의 가격을 확인하고 배송 정보를 입력하여 즉시 주문
- 📦 **진행 상태 추적** — 주문 목록 및 상세 정보 조회를 통한 제작/배송 상태 확인

## 실행 방법

### 사전 요구사항
- Node.js 18 이상
- SweetBook Sandbox API Key ([api.sweetbook.com](https://api.sweetbook.com) 에서 발급)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/ij0727hwang/photobook.git
cd photobook

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
`public/dummy/` 폴더에 예시 사진이 포함되어 있습니다. 포토북 제작 시 이 사진들을 활용하여 테스트해볼 수 있습니다.

## 사용한 요금/주문 API (SweetBook)

| API | 용도 |
|-----|------|
| `GET /book-specs` | 판형 정보 조회 |
| `GET /templates` | 템플릿 목록 조회 |
| `POST /books` | 새 포토북 초안 생성 |
| `POST /books/{bookUid}/photos` | 포토북에 사진 리소스 업로드 |
| `POST /books/{bookUid}/cover` | 표지 구성 추가 |
| `POST /books/{bookUid}/contents` | 내지 페이지 구성 추가 |
| `POST /books/{bookUid}/finalization` | 포토북 최종화 처리 |
| `POST /orders/estimate` | 주문 견적(가격) 조회 |
| `POST /orders` | 주문 생성 및 결제 |
| `GET /orders`, `GET /orders/{orderUid}` | 주문 조회 |
| `GET /credits` | 계정 충전금 잔액 조회 |

## AI 도구 사용 내역

| AI 도구 | 활용 내용 |
|---------|----------|
| Gemini (Antigravity) | 스퀘어 하드커버 전용 워크플로우로 프로젝트 아키텍처 리팩토링 |
| Gemini (Antigravity) | SweetBook API 통합 및 자동화 파이프라인 구축 |
| Gemini (Antigravity) | 프리미엄 다크 모드 기반의 UI/UX 디자인 개선 |
| Gemini (Image Gen) | 더미 데이터(표지, 내지)용 예시 사진 생성 |

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | Next.js 14 (App Router), React 18 |
| 백엔드 | Next.js API Routes (SweetBook API 프록시 적용) |
| 스타일링 | Vanilla CSS (CSS Modules)를 활용한 커스텀 디자인 시스템 |
| 상태관리 | React Hooks (useState, useEffect 등) |

## 설계 의도

### 왜 "스퀘어 하드커버" 전용으로 개편했는가?
여러 판형과 복잡한 템플릿을 제공하는 것도 좋지만, 사용자가 가장 고민 없이 만족스러운 결과를 얻을 수 있도록 가장 인기있고 트렌디한 "스퀘어 하드커버" 포맷에 집중했습니다. 규격이 단순해짐으로써 사진 업로드와 배치가 더욱 빠르고 매끄러워졌습니다.

### 비즈니스 확장 (Puppy Log 등)
특정 테마(예: 반려동물 성장 일기 "Puppy Log", 여행 기록 등)에 맞춘 맞춤형 포토북 서비스로 쉽게 변형할 수 있는 구조로 설계되었습니다.

### 향후 추가 가능한 기능
- 사진 순서 드래그&드롭 기반 자유 재배치 기능
- 3D 또는 펼침면 기반의 사실적인 포토북 미리보기
- 소셜/OAuth 로그인 및 사용자 계정 관리 시스템 연동
- 다수의 상품을 한번에 주문하는 장바구니 기능