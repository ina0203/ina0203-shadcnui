# 패션 아웃핏 관리 앱 개발 계획

## 구현할 파일 목록

### 1. 레이아웃 및 네비게이션
- `src/components/Layout.tsx` - 전체 레이아웃 (사이드바 네비게이션 포함)

### 2. 페이지 컴포넌트
- `src/pages/Index.tsx` - 홈 대시보드 (통계, 최근 활동)
- `src/pages/OutfitBank.tsx` - 아웃핏 뱅크 (코디 카드 관리)
- `src/pages/Closet.tsx` - 옷장 관리 (아이템 등록 및 착용 기록)
- `src/pages/Resale.tsx` - 리셀 센터 (리셀 추천가 계산)
- `src/pages/MyPage.tsx` - 마이페이지 (포인트, 분석)

### 3. 데이터 타입 및 유틸리티
- `src/types/index.ts` - TypeScript 타입 정의
- `src/lib/storage.ts` - localStorage 기반 데이터 관리
- `src/lib/calculations.ts` - 수익, 리셀가, 포인트 계산 로직

### 4. 라우팅 업데이트
- `src/App.tsx` - 라우팅 설정 업데이트

### 5. 메타 정보 업데이트
- `index.html` - 타이틀 및 메타 정보 업데이트

## 주요 기능

### 홈 대시보드
- 총 아이템 수, 총 지출액, 평균 활용률, 적립 포인트 표시
- 최근 착용 기록 목록
- 빠른 액션 버튼

### Outfit Bank
- 코디 카드 생성 (이미지 업로드, 제목, 설명)
- 쇼핑몰 상품 링크 추가 (상품명, 가격, URL)
- 인스타그램 인사이트 입력 (좋아요, 댓글 수)
- 예상 수익 계산 및 표시

### Wear-to-Earn Closet
- 옷 아이템 등록 (사진, 브랜드, 구매가, 구매일)
- 착용 기록 추가 (날짜, 사진)
- 착용당 포인트 적립 (100포인트/착용)
- 아이템별 활용률 분석

### 리셀 센터
- 리셀 추천가 자동 계산 (구매가 × 감가율)
- 감가율 = 기본 50% - (착용 횟수 × 2%) - (경과 개월 × 1%)
- 리셀 가능 아이템 목록
- 예상 판매가 표시

### 마이페이지
- 총 적립 포인트
- 월별 지출 분석 차트
- 아이템별 활용률 순위
- 옷장 가치 분석 (총 구매가 vs 현재 리셀 가치)

## 데이터 구조

### OutfitCard (아웃핏 카드)
- id, title, description, imageUrl
- products: [{ name, price, url }]
- likes, comments
- estimatedRevenue
- createdAt

### ClothingItem (옷 아이템)
- id, name, brand, imageUrl
- purchasePrice, purchaseDate
- wearRecords: [{ date, imageUrl }]
- wearCount, points
- utilizationRate

### UserStats (사용자 통계)
- totalItems, totalSpending
- totalPoints, averageUtilization