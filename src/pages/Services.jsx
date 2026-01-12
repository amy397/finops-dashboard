import React, { useState, useEffect } from 'react';
import ServicePieChart from '../components/ServicePieChart';
import { getServiceCosts } from '../api/costApi';

function Services() {
  const [serviceCosts, setServiceCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getServiceCosts(dateRange.startDate, dateRange.endDate);
        setServiceCosts(response.data);
      } catch (error) {
        console.error('Failed to load service costs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const totalCost = serviceCosts.reduce((sum, item) => sum + parseFloat(item.totalCost || 0), 0);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="services-page">
      <h1>Service Costs</h1>
      <p>서비스별 비용 현황</p>

      <div className="date-filter">
        <label>
          시작일:
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </label>
        <label>
          종료일:
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </label>
      </div>

      <div className="services-content">
        {serviceCosts.length > 0 ? (
          <>
            <div className="chart-section">
              <ServicePieChart data={serviceCosts} />
            </div>

            <div className="table-section">
              <h3>서비스별 상세 비용</h3>
              <table className="services-table">
                <thead>
                  <tr>
                    <th>서비스명</th>
                    <th>비용</th>
                    <th>비율</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceCosts.map((service, index) => (
                    <tr key={index}>
                      <td>{service.serviceName}</td>
                      <td>${parseFloat(service.totalCost).toFixed(2)}</td>
                      <td>{service.percentage ? `${parseFloat(service.percentage).toFixed(1)}%` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>합계</strong></td>
                    <td><strong>${totalCost.toFixed(2)}</strong></td>
                    <td><strong>100%</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        ) : (
          <p className="no-data">해당 기간의 서비스 비용 데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default Services;
