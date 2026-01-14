import React, { useState, useEffect } from 'react';
import { getComplianceScore, getPolicies, createPolicy, runComplianceScan, getNonCompliantResources } from '../api/complianceApi';

function TagCompliance() {
  const [score, setScore] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [nonCompliant, setNonCompliant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    policyName: '',
    description: '',
    resourceTypes: ['EC2'],
    requiredTags: [{ tagKey: '', allowedValues: '' }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scoreRes, policiesRes, nonCompliantRes] = await Promise.all([
        getComplianceScore(),
        getPolicies(),
        getNonCompliantResources(0, 50)
      ]);
      setScore(scoreRes.data);
      setPolicies(policiesRes.data);
      setNonCompliant(nonCompliantRes.data.content || nonCompliantRes.data);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      await runComplianceScan();
      await fetchData();
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setScanning(false);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...newPolicy,
        requiredTags: newPolicy.requiredTags.map(t => ({
          tagKey: t.tagKey,
          allowedValues: t.allowedValues ? t.allowedValues.split(',').map(v => v.trim()) : []
        }))
      };
      await createPolicy(data);
      setShowPolicyForm(false);
      setNewPolicy({
        policyName: '',
        description: '',
        resourceTypes: ['EC2'],
        requiredTags: [{ tagKey: '', allowedValues: '' }]
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create policy:', error);
    }
  };

  const addRequiredTag = () => {
    setNewPolicy(prev => ({
      ...prev,
      requiredTags: [...prev.requiredTags, { tagKey: '', allowedValues: '' }]
    }));
  };

  const updateRequiredTag = (index, field, value) => {
    const updated = [...newPolicy.requiredTags];
    updated[index][field] = value;
    setNewPolicy(prev => ({ ...prev, requiredTags: updated }));
  };

  const getScoreColor = (pct) => {
    if (pct >= 80) return '#10b981';
    if (pct >= 50) return '#f59e0b';
    return '#dc2626';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="compliance-page">
      <div className="page-header">
        <h1>Tag Compliance</h1>
        <div className="header-actions">
          <button className="scan-btn" onClick={handleScan} disabled={scanning}>
            {scanning ? 'Scanning...' : 'Run Scan'}
          </button>
          <button className="create-btn" onClick={() => setShowPolicyForm(true)}>
            + New Policy
          </button>
        </div>
      </div>

      {score && (
        <div className="score-section">
          <div className="score-card main-score">
            <div className="score-circle" style={{ borderColor: getScoreColor(score.overallScore) }}>
              <span className="score-value">{score.overallScore?.toFixed(0)}%</span>
            </div>
            <h3>Overall Compliance</h3>
          </div>
          <div className="score-details">
            <div className="detail-card">
              <h4>Total Resources</h4>
              <p>{score.totalResources}</p>
            </div>
            <div className="detail-card compliant">
              <h4>Compliant</h4>
              <p>{score.compliantResources}</p>
            </div>
            <div className="detail-card non-compliant">
              <h4>Non-Compliant</h4>
              <p>{score.nonCompliantResources}</p>
            </div>
            <div className="detail-card">
              <h4>Active Policies</h4>
              <p>{policies.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="policies-section">
        <h2>Tagging Policies</h2>
        <div className="policies-list">
          {policies.map((policy) => (
            <div key={policy.id} className="policy-card">
              <div className="policy-header">
                <h3>{policy.policyName}</h3>
                <span className={`status-badge ${policy.enabled ? 'active' : 'inactive'}`}>
                  {policy.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="policy-description">{policy.description}</p>
              <div className="policy-details">
                <span>Resources: {policy.resourceTypes?.join(', ')}</span>
                <span>Required Tags: {policy.requiredTags?.length || 0}</span>
              </div>
            </div>
          ))}
          {policies.length === 0 && (
            <p className="empty-message">No policies defined. Create your first tagging policy.</p>
          )}
        </div>
      </div>

      <div className="non-compliant-section">
        <h2>Non-Compliant Resources</h2>
        <table className="compliance-table">
          <thead>
            <tr>
              <th>Resource ID</th>
              <th>Type</th>
              <th>Region</th>
              <th>Missing Tags</th>
              <th>Invalid Tags</th>
            </tr>
          </thead>
          <tbody>
            {nonCompliant.map((item) => (
              <tr key={item.id}>
                <td>{item.resourceId}</td>
                <td><span className="type-badge">{item.resourceType}</span></td>
                <td>{item.region}</td>
                <td className="tags-cell">
                  {item.missingTags?.map(tag => (
                    <span key={tag} className="tag missing">{tag}</span>
                  ))}
                </td>
                <td className="tags-cell">
                  {item.invalidTags?.map(tag => (
                    <span key={tag} className="tag invalid">{tag}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {nonCompliant.length === 0 && (
          <p className="empty-message">All resources are compliant!</p>
        )}
      </div>

      {showPolicyForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Tagging Policy</h2>
            <form onSubmit={handleCreatePolicy}>
              <div className="form-group">
                <label>Policy Name *</label>
                <input
                  type="text"
                  value={newPolicy.policyName}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, policyName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label>Resource Types</label>
                <select
                  multiple
                  value={newPolicy.resourceTypes}
                  onChange={(e) => setNewPolicy(prev => ({
                    ...prev,
                    resourceTypes: Array.from(e.target.selectedOptions, o => o.value)
                  }))}
                >
                  <option value="EC2">EC2</option>
                  <option value="RDS">RDS</option>
                  <option value="S3">S3</option>
                  <option value="LAMBDA">Lambda</option>
                </select>
              </div>
              <div className="form-group">
                <label>Required Tags</label>
                {newPolicy.requiredTags.map((tag, index) => (
                  <div key={index} className="tag-row">
                    <input
                      type="text"
                      placeholder="Tag Key (e.g., Environment)"
                      value={tag.tagKey}
                      onChange={(e) => updateRequiredTag(index, 'tagKey', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Allowed Values (comma-separated)"
                      value={tag.allowedValues}
                      onChange={(e) => updateRequiredTag(index, 'allowedValues', e.target.value)}
                    />
                  </div>
                ))}
                <button type="button" onClick={addRequiredTag} className="add-tag-btn">+ Add Tag</button>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowPolicyForm(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Create Policy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .compliance-page { padding: 20px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .header-actions { display: flex; gap: 10px; }
        .scan-btn, .create-btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .scan-btn { background: #e3f2fd; color: #1976d2; }
        .scan-btn:disabled { background: #ccc; }
        .create-btn { background: #1976d2; color: white; }
        .score-section { display: flex; gap: 20px; margin-bottom: 30px; }
        .score-card { background: white; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .main-score { min-width: 200px; }
        .score-circle { width: 120px; height: 120px; border-radius: 50%; border: 8px solid; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; }
        .score-value { font-size: 32px; font-weight: bold; }
        .score-details { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; flex: 1; }
        .detail-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .detail-card h4 { margin: 0 0 10px; color: #666; font-size: 14px; }
        .detail-card p { margin: 0; font-size: 28px; font-weight: bold; }
        .detail-card.compliant p { color: #10b981; }
        .detail-card.non-compliant p { color: #dc2626; }
        .policies-section, .non-compliant-section { margin-bottom: 30px; }
        .policies-section h2, .non-compliant-section h2 { margin-bottom: 15px; }
        .policies-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
        .policy-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .policy-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .policy-header h3 { margin: 0; }
        .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; }
        .status-badge.active { background: #d1fae5; color: #065f46; }
        .status-badge.inactive { background: #f3f4f6; color: #6b7280; }
        .policy-description { color: #666; margin-bottom: 10px; }
        .policy-details { display: flex; gap: 15px; font-size: 13px; color: #888; }
        .compliance-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
        .compliance-table th, .compliance-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        .compliance-table th { background: #f5f5f5; font-weight: 600; }
        .type-badge { padding: 4px 8px; background: #e3f2fd; color: #1976d2; border-radius: 4px; font-size: 12px; }
        .tags-cell { display: flex; flex-wrap: wrap; gap: 5px; }
        .tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .tag.missing { background: #fee2e2; color: #991b1b; }
        .tag.invalid { background: #fef3c7; color: #92400e; }
        .empty-message { color: #666; font-style: italic; padding: 20px; text-align: center; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; padding: 30px; border-radius: 8px; width: 500px; max-height: 80vh; overflow-y: auto; }
        .modal h2 { margin-top: 0; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .tag-row { display: flex; gap: 10px; margin-bottom: 10px; }
        .tag-row input { flex: 1; }
        .add-tag-btn { padding: 6px 12px; background: #f5f5f5; border: 1px dashed #ccc; border-radius: 4px; cursor: pointer; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .modal-actions button { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        .modal-actions .submit-btn { background: #1976d2; color: white; }
      `}</style>
    </div>
  );
}

export default TagCompliance;
