import React, { useState, useEffect } from 'react';
import KpiCard from '../components/KpiCard';
import CostChart from '../components/CostChart';
import ServicePieChart from '../components/ServicePieChart';
import { getCostSummary, getDailyCosts } from '../api/costApi';

function Overview() {
  const [summary, setSummary] = useState(null);
  const [dailyCosts, setDailyCosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, costsRes] = await Promise.all([
          getCostSummary(),
          getDailyCosts(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date().toISOString().split('T')[0]
          )
        ]);
        setSummary(summaryRes.data);
        setDailyCosts(costsRes.data);
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="overview">
      <h1>Cost Overview</h1>
      <div className="kpi-grid">
        <KpiCard title="This Month" value={`$${summary?.currentMonthCost?.toFixed(2) || '0'}`} change={summary?.changePercent} icon="💰" />
        <KpiCard title="Today" value={`$${summary?.todayCost?.toFixed(2) || '0'}`} icon="📊" />
        <KpiCard title="Yesterday" value={`$${summary?.yesterdayCost?.toFixed(2) || '0'}`} icon="📈" />
        <KpiCard title="Last Month" value={`$${summary?.previousMonthCost?.toFixed(2) || '0'}`} icon="📅" />
      </div>
      <div className="charts-grid">
        <CostChart data={dailyCosts} />
        {summary?.topServices && <ServicePieChart data={summary.topServices} />}
      </div>
    </div>
  );
}

export default Overview;
