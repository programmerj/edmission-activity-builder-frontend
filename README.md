# 활동 빌더 프론트엔드 (Activity Builder Frontend)

이 디렉토리는 Edmission 활동 빌더의 사용자 인터페이스(UI) 프로그램입니다. **React**와 **Vite**를 기반으로 하며, 학생들이 자신의 과외 활동을 관리하고 대입 경쟁력을 시각화할 수 있도록 돕습니다.

## 주요 기능

- **실시간 임팩트 계산**: 입력한 활동의 티어, 리더십 여부, 주당 활동 시간에 따라 영향력 점수가 실시간으로 계산됩니다.
- **활동 통합 관리 (CRUD)**: 활동을 추가하고 목록을 조회하며, 수정 및 삭제가 가능합니다.
- **세련된 UI/UX**:
    - **shadcn/ui**를 활용한 깔끔하고 직관적인 디자인.
    - **다크 모드** 지원 (태양/달 아이콘으로 쉽게 전환 가능).
    - 활동 카드의 직관적인 레이아웃 (이름, 임팩트 점수, 카테고리, 설명 순).
- **입력 유효성 검사**:
    - 주당 시간 제한 (40시간 이하).
    - 설명 글자 수 제한 (150자 이하).
    - 에러 발생 시 입력란에 **빨간색 테두리** 표시.
- **인터랙티브 요소**: 입력란 포커스 시 자동으로 전체 선택(`select on focus`) 및 굵은 테두리 효과.

## 기술 스택

- **Core**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, CSS Variables
- **UI Components**: shadcn/ui (Radix UI 기반)
- **Icons**: Lucide React
- **API Client**: Fetch API

## 설치 및 실행 방법

### 1. 요구 사항
- Node.js 18 버전 이상

### 2. 패키지 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 주요 컴포넌트 구조

- `src/components/ActivityBuilder.tsx`: 활동 빌더의 메인 로직과 UI가 포함된 핵심 컴포넌트.
- `src/components/ui/`: shadcn/ui 기반의 재사용 가능한 UI 컴포넌트들 (Card, Button, Input, Badge 등).
- `src/lib/api.ts`: 백엔드 서버와의 통신을 담당하는 API 모듈.
