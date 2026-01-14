import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBudgetDashboard, deleteBudget } from '../api/budgetApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function Budgets() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await getBudgetDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to load budget dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete budget:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EXCEEDED': return '#dc2626';
      case 'WARNING': return '#f59e0b';
      default: return '#10b981';
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="budgets-page">
      <div className="page-header">
        <h1>Budget Management</h1>
        <button className="create-btn" onClick={() => navigate('/budgets/new')}>
          + Create Budget
        </button>
      </div>

      {dashboard && (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Budgets</h3>
              <p className="big-number">{dashboard.totalBudgets}</p>
            </div>
            <div className="summary-card">
              <h3>Total Budget</h3>
              <p className="big-number">${dashboard.totalBudgetAmount?.toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h3>Total Spent</h3>
              <p className="big-number">${dashboard.totalActualAmount?.toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h3>Overall Usage</h3>
              <p className="big-number">{dashboard.overallUsagePercent?.toFixed(1)}%</p>
            </div>
            <div className="summary-card exceeded">
              <h3>Exceeded</h3>
              <p className="big-number">{dashboard.exceededCount}</p>
            </div>
            <div className="summary-card warning">
              <h3>Warning</h3>
              <p className="big-number">{dashboard.warningCount}</p>
            </div>
          </div>

          {dashboard.budgetUsages && dashboard.budgetUsages.length > 0 && (
            <div className="chart-section">
              <h2>Budget Usage Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboard.budgetUsages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="budgetName" />
                  <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 120]} />
                  <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                  <Bar dataKey="usagePercent" name="Usage %">
                    {dashboard.budgetUsages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="budget-list">
            <h2>All Budgets</h2>
            {dashboard.budgetUsages?.map((usage) => (
              <div key={usage.budgetId} className="budget-card">
                <div className="budget-header">
                  <h3>{usage.budgetName}</h3>
                  <span className={`status-badge ${usage.status.toLowerCase()}`}>{usage.status}</span>
                </div>
                <div className="budget-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(usage.usagePercent, 100)}%`,
                        backgroundColor: getStatusColor(usage.status)
                      }}
                    />
                  </div>
                  <span className="progress-text">{usage.usagePercent?.toFixed(1)}%</span>
                </div>
                <div className="budget-details">
                  <span>Spent: ${usage.actualAmount?.toFixed(2)}</span>
                  <span>Budget: ${usage.budgetAmount?.toFixed(2)}</span>
                  <span>Remaining: ${usage.remainingAmount?.toFixed(2)}</span>
                </div>
                <div className="budget-actions">
                  <button onClick={() => navigate(`/budgets/${usage.budgetId}`)}>View</button>
                  <button onClick={() => handleDelete(usage.budgetId)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .budgets-page { padding: 20px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .create-btn { padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .summary-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; }
        .summary-card .big-number { font-size: 24px; font-weight: bold; margin: 0; }
        .summary-card.exceeded .big-number { color: #dc2626; }
        .summary-card.warning .big-number { color: #f59e0b; }
        .chart-section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .budget-list h2 { margin-bottom: 15px; }
        .budget-card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .budget-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .budget-header h3 { margin: 0; }
        .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .status-badge.on_track { background: #d1fae5; color: #065f46; }
        .status-badge.warning { background: #fef3c7; color: #92400e; }
        .status-badge.exceeded { background: #fee2e2; color: #991b1b; }
        .budget-progress { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
        .progress-bar { flex: 1; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 0.3s; }
        .progress-text { font-weight: 600; min-width: 60px; }
        .budget-details { display: flex; gap: 20px; color: #666; font-size: 14px; margin-bottom: 15px; }
        .budget-actions { display: flex; gap: 10px; }
        .budget-actions button { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
        .budget-actions button:first-child { background: #e3f2fd; color: #1976d2; }
        .budget-actions .delete-btn { background: #fee2e2; color: #dc2626; }
      `}</style>
    </div>
  );
}

export default Budgets;
