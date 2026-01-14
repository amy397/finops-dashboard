import React, { useState, useEffect } from 'react';
import { getResources, getResourceSummary, syncResources } from '../api/resourceApi';

function Resources() {
  const [resources, setResources] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resourcesRes, summaryRes] = await Promise.all([
        getResources(0, 100),
        getResourceSummary()
      ]);
      setResources(resourcesRes.data.content || resourcesRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncResources();
      await fetchData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const filteredResources = filter === 'ALL'
    ? resources
    : resources.filter(r => r.resourceType === filter);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="resources-page">
      <div className="page-header">
        <h1>Resource Inventory</h1>
        <button
          className="sync-btn"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? 'Syncing...' : 'Sync Resources'}
        </button>
      </div>

      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Resources</h3>
            <p className="big-number">{summary.totalResources}</p>
          </div>
          <div className="summary-card">
            <h3>EC2 Instances</h3>
            <p className="big-number">{summary.byType?.EC2 || 0}</p>
          </div>
          <div className="summary-card">
            <h3>RDS Instances</h3>
            <p className="big-number">{summary.byType?.RDS || 0}</p>
          </div>
          <div className="summary-card">
            <h3>S3 Buckets</h3>
            <p className="big-number">{summary.byType?.S3 || 0}</p>
          </div>
          <div className="summary-card">
            <h3>Lambda Functions</h3>
            <p className="big-number">{summary.byType?.LAMBDA || 0}</p>
          </div>
          <div className="summary-card warning">
            <h3>Idle Resources</h3>
            <p className="big-number">{summary.idleResources}</p>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <label>Filter by Type: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">All</option>
          <option value="EC2">EC2</option>
          <option value="RDS">RDS</option>
          <option value="S3">S3</option>
          <option value="LAMBDA">Lambda</option>
        </select>
      </div>

      <table className="resources-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Region</th>
            <th>State</th>
            <th>Instance Type</th>
            <th>Last Synced</th>
          </tr>
        </thead>
        <tbody>
          {filteredResources.map((resource) => (
            <tr key={resource.id}>
              <td>{resource.resourceName || resource.resourceId}</td>
              <td><span className={`type-badge ${resource.resourceType.toLowerCase()}`}>{resource.resourceType}</span></td>
              <td>{resource.region}</td>
              <td><span className={`state-badge ${resource.state?.toLowerCase()}`}>{resource.state}</span></td>
              <td>{resource.instanceType || '-'}</td>
              <td>{resource.lastSyncedAt ? new Date(resource.lastSyncedAt).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .resources-page { padding: 20px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .sync-btn { padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .sync-btn:disabled { background: #ccc; }
        .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .summary-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; }
        .summary-card .big-number { font-size: 28px; font-weight: bold; margin: 0; }
        .summary-card.warning .big-number { color: #f57c00; }
        .filter-bar { margin-bottom: 15px; }
        .filter-bar select { padding: 8px; margin-left: 10px; }
        .resources-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
        .resources-table th, .resources-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        .resources-table th { background: #f5f5f5; font-weight: 600; }
        .type-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .type-badge.ec2 { background: #e3f2fd; color: #1976d2; }
        .type-badge.rds { background: #fce4ec; color: #c2185b; }
        .type-badge.s3 { background: #e8f5e9; color: #388e3c; }
        .type-badge.lambda { background: #fff3e0; color: #f57c00; }
        .state-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .state-badge.running, .state-badge.active, .state-badge.available { background: #e8f5e9; color: #388e3c; }
        .state-badge.stopped { background: #ffebee; color: #c62828; }
      `}</style>
    </div>
  );
}

export default Resources;
