import React, { useState, useEffect } from 'react';
import { getReports, generateReport, downloadReport } from '../api/reportApi';

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [formData, setFormData] = useState({
    reportType: 'COST_SUMMARY',
    format: 'PDF',
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    groupBy: 'SERVICE',
    includeCharts: true,
    recipientEmails: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await getReports();
      setReports(response.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const data = {
        ...formData,
        recipientEmails: formData.recipientEmails
          ? formData.recipientEmails.split(',').map(e => e.trim())
          : []
      };
      await generateReport(data);
      setShowGenerator(false);
      fetchReports();
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    try {
      const response = await downloadReport(report.id);
      const blob = new Blob([response.data], {
        type: report.format === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'GENERATING': return '#f59e0b';
      case 'FAILED': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Cost Reports</h1>
        <button className="generate-btn" onClick={() => setShowGenerator(true)}>
          + Generate Report
        </button>
      </div>

      <div className="report-types">
        <div className="type-card">
          <div className="type-icon">📊</div>
          <h3>Cost Summary</h3>
          <p>Overview of costs by service, account, or tag</p>
        </div>
        <div className="type-card">
          <div className="type-icon">📈</div>
          <h3>Trend Analysis</h3>
          <p>Cost trends and forecasts over time</p>
        </div>
        <div className="type-card">
          <div className="type-icon">🏷️</div>
          <h3>Tag Report</h3>
          <p>Cost breakdown by tag key/value pairs</p>
        </div>
        <div className="type-card">
          <div className="type-icon">💡</div>
          <h3>Optimization</h3>
          <p>Savings recommendations and opportunities</p>
        </div>
      </div>

      <div className="reports-section">
        <h2>Generated Reports</h2>
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Type</th>
              <th>Format</th>
              <th>Date Range</th>
              <th>Size</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.fileName}</td>
                <td><span className="type-badge">{report.reportType?.replace('_', ' ')}</span></td>
                <td><span className={`format-badge ${report.format?.toLowerCase()}`}>{report.format}</span></td>
                <td>{report.startDate} ~ {report.endDate}</td>
                <td>{formatFileSize(report.fileSize)}</td>
                <td>
                  <span className="status-dot" style={{ backgroundColor: getStatusColor(report.status) }}></span>
                  {report.status}
                </td>
                <td>{report.createdAt ? new Date(report.createdAt).toLocaleString() : '-'}</td>
                <td>
                  {report.status === 'COMPLETED' && (
                    <button className="download-btn" onClick={() => handleDownload(report)}>
                      Download
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && (
          <p className="empty-message">No reports generated yet. Click "Generate Report" to create your first report.</p>
        )}
      </div>

      {showGenerator && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Generate Cost Report</h2>
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label>Report Type *</label>
                <select
                  value={formData.reportType}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value }))}
                >
                  <option value="COST_SUMMARY">Cost Summary</option>
                  <option value="TREND_ANALYSIS">Trend Analysis</option>
                  <option value="TAG_REPORT">Tag Report</option>
                  <option value="OPTIMIZATION">Optimization Report</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Format *</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
                  >
                    <option value="PDF">PDF</option>
                    <option value="EXCEL">Excel</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Group By</label>
                  <select
                    value={formData.groupBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, groupBy: e.target.value }))}
                  >
                    <option value="SERVICE">Service</option>
                    <option value="ACCOUNT">Account</option>
                    <option value="REGION">Region</option>
                    <option value="TAG">Tag</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.includeCharts}
                    onChange={(e) => setFormData(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  />
                  Include charts and visualizations
                </label>
              </div>

              <div className="form-group">
                <label>Email Recipients (optional)</label>
                <input
                  type="text"
                  value={formData.recipientEmails}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipientEmails: e.target.value }))}
                  placeholder="email1@example.com, email2@example.com"
                />
                <small>Comma-separated email addresses to receive the report</small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowGenerator(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={generating}>
                  {generating ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .reports-page { padding: 20px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .generate-btn { padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .report-types { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
        .type-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s; }
        .type-card:hover { transform: translateY(-2px); }
        .type-icon { font-size: 32px; margin-bottom: 10px; }
        .type-card h3 { margin: 0 0 8px; }
        .type-card p { margin: 0; color: #666; font-size: 13px; }
        .reports-section h2 { margin-bottom: 15px; }
        .reports-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
        .reports-table th, .reports-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        .reports-table th { background: #f5f5f5; font-weight: 600; }
        .type-badge { padding: 4px 8px; background: #e8f5e9; color: #388e3c; border-radius: 4px; font-size: 12px; text-transform: capitalize; }
        .format-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .format-badge.pdf { background: #fee2e2; color: #dc2626; }
        .format-badge.excel { background: #d1fae5; color: #065f46; }
        .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
        .download-btn { padding: 6px 12px; background: #e3f2fd; color: #1976d2; border: none; border-radius: 4px; cursor: pointer; }
        .empty-message { color: #666; font-style: italic; padding: 40px; text-align: center; background: white; border-radius: 8px; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; padding: 30px; border-radius: 8px; width: 500px; max-height: 80vh; overflow-y: auto; }
        .modal h2 { margin-top: 0; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .form-group small { display: block; margin-top: 4px; color: #888; font-size: 12px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .checkbox-label { display: flex; align-items: center; gap: 8px; font-weight: normal; cursor: pointer; }
        .checkbox-label input { width: auto; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .modal-actions button { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .modal-actions .submit-btn { background: #1976d2; color: white; }
        .modal-actions .submit-btn:disabled { background: #ccc; }
      `}</style>
    </div>
  );
}

export default Reports;
