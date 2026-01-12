import React, { useState, useEffect } from 'react';
import AlertList from '../components/AlertList';
import { getCostSummary } from '../api/costApi';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 비용 요약 데이터를 기반으로 알림 생성
        const response = await getCostSummary();
        const summary = response.data;
        const generatedAlerts = [];

        // 일일 비용 급증 체크 (20% 이상)
        if (summary.yesterdayCost && summary.todayCost) {
          const increase = ((summary.todayCost - summary.yesterdayCost) / summary.yesterdayCost) * 100;
          if (increase > 20) {
            generatedAlerts.push({
              type: 'warning',
              title: '일일 비용 급증',
              message: `전일 대비 ${increase.toFixed(1)}% 증가 ($${summary.yesterdayCost.toFixed(2)} → $${summary.todayCost.toFixed(2)})`,
              time: new Date().toLocaleString('ko-KR')
            });
          }
        }

        // 월간 예산 초과 체크 (예: $10,000)
        const monthlyBudget = 10000;
        if (summary.currentMonthCost > monthlyBudget) {
          generatedAlerts.push({
            type: 'danger',
            title: '월간 예산 초과',
            message: `이번 달 비용 $${summary.currentMonthCost.toFixed(2)}이(가) 예산 $${monthlyBudget.toFixed(2)}을(를) 초과했습니다.`,
            time: new Date().toLocaleString('ko-KR')
          });
        }

        // 전월 대비 비용 증가 체크
        if (summary.changePercent > 30) {
          generatedAlerts.push({
            type: 'warning',
            title: '월간 비용 급증',
            message: `전월 대비 ${summary.changePercent.toFixed(1)}% 비용이 증가했습니다.`,
            time: new Date().toLocaleString('ko-KR')
          });
        }

        // 알림이 없으면 정상 상태 메시지
        if (generatedAlerts.length === 0) {
          generatedAlerts.push({
            type: 'info',
            title: '정상 운영 중',
            message: '현재 모든 비용 지표가 정상 범위 내에 있습니다.',
            time: new Date().toLocaleString('ko-KR')
          });
        }

        setAlerts(generatedAlerts);
      } catch (error) {
        console.error('Failed to load alerts:', error);
        setAlerts([{
          type: 'danger',
          title: '데이터 로드 실패',
          message: '알림 데이터를 불러오는데 실패했습니다.',
          time: new Date().toLocaleString('ko-KR')
        }]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="alerts-page">
      <h1>Cost Alerts</h1>
      <p>비용 알림 목록</p>

      <div className="alert-settings">
        <h3>알림 설정</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <span>일일 비용 급증 임계값</span>
            <span>20%</span>
          </div>
          <div className="setting-item">
            <span>월간 예산</span>
            <span>$10,000</span>
          </div>
          <div className="setting-item">
            <span>월간 비용 증가 임계값</span>
            <span>30%</span>
          </div>
        </div>
      </div>

      <div className="alerts-content">
        <AlertList alerts={alerts} />
      </div>

      <div className="alert-history">
        <h3>알림 이력</h3>
        <table className="alerts-table">
          <thead>
            <tr>
              <th>상태</th>
              <th>제목</th>
              <th>내용</th>
              <th>시간</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, index) => (
              <tr key={index} className={alert.type}>
                <td>
                  <span className={`status-badge ${alert.type}`}>
                    {alert.type === 'danger' ? '위험' : alert.type === 'warning' ? '경고' : '정보'}
                  </span>
                </td>
                <td>{alert.title}</td>
                <td>{alert.message}</td>
                <td>{alert.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Alerts;
