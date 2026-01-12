# FinOps Dashboard

AWS 비용 시각화를 위한 React 대시보드

## 기능

- 일별 비용 추이 차트
- 서비스별 비용 파이 차트
- 비용 알림 목록
- KPI 카드 (총 비용, 전월 대비 등)

## 기술 스택

- React 18
- React Router v6
- Recharts (차트 라이브러리)
- Axios (HTTP 클라이언트)

## 로컬 실행

```bash
npm install
npm start
```

## Docker 빌드

```bash
docker build -t finops-dashboard .
```

## 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| REACT_APP_API_URL | API 서버 URL | http://localhost:8080/api |
