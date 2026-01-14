import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBudget } from '../api/budgetApi';

function BudgetForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    budgetType: 'PROJECT',
    targetId: '',
    amount: '',
    periodType: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    thresholds: [
      { thresholdPercent: 50, notificationType: 'SLACK' },
      { thresholdPercent: 80, notificationType: 'SLACK' },
      { thresholdPercent: 100, notificationType: 'SLACK' }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleThresholdChange = (index, field, value) => {
    const newThresholds = [...formData.thresholds];
    newThresholds[index][field] = field === 'thresholdPercent' ? parseInt(value) : value;
    setFormData(prev => ({ ...prev, thresholds: newThresholds }));
  };

  const addThreshold = () => {
    setFormData(prev => ({
      ...prev,
      thresholds: [...prev.thresholds, { thresholdPercent: 50, notificationType: 'SLACK' }]
    }));
  };

  const removeThreshold = (index) => {
    setFormData(prev => ({
      ...prev,
      thresholds: prev.thresholds.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      await createBudget(data);
      navigate('/budgets');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="budget-form-page">
      <h1>Create Budget</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="budget-form">
        <div className="form-group">
          <label>Budget Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Q1 Infrastructure Budget"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Budget Type *</label>
            <select name="budgetType" value={formData.budgetType} onChange={handleChange}>
              <option value="PROJECT">Project</option>
              <option value="TEAM">Team</option>
              <option value="SERVICE">Service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target ID</label>
            <input
              type="text"
              name="targetId"
              value={formData.targetId}
              onChange={handleChange}
              placeholder="Project or Team ID"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Amount (USD) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              placeholder="10000"
            />
          </div>

          <div className="form-group">
            <label>Period Type *</label>
            <select name="periodType" value={formData.periodType} onChange={handleChange}>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            placeholder="Budget description..."
          />
        </div>

        <div className="thresholds-section">
          <div className="section-header">
            <h3>Alert Thresholds</h3>
            <button type="button" onClick={addThreshold} className="add-btn">+ Add</button>
          </div>

          {formData.thresholds.map((threshold, index) => (
            <div key={index} className="threshold-row">
              <input
                type="number"
                value={threshold.thresholdPercent}
                onChange={(e) => handleThresholdChange(index, 'thresholdPercent', e.target.value)}
                min="1"
                max="200"
                placeholder="%"
              />
              <span>%</span>
              <select
                value={threshold.notificationType}
                onChange={(e) => handleThresholdChange(index, 'notificationType', e.target.value)}
              >
                <option value="SLACK">Slack</option>
                <option value="EMAIL">Email</option>
                <option value="BOTH">Both</option>
              </select>
              <button type="button" onClick={() => removeThreshold(index)} className="remove-btn">X</button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/budgets')} className="cancel-btn">Cancel</button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating...' : 'Create Budget'}
          </button>
        </div>
      </form>

      <style>{`
        .budget-form-page { padding: 20px; max-width: 800px; }
        .error-message { background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 4px; margin-bottom: 20px; }
        .budget-form { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .thresholds-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .section-header h3 { margin: 0; }
        .add-btn { padding: 6px 12px; background: #e3f2fd; color: #1976d2; border: none; border-radius: 4px; cursor: pointer; }
        .threshold-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .threshold-row input { width: 80px; }
        .threshold-row select { flex: 1; }
        .remove-btn { padding: 6px 10px; background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; cursor: pointer; }
        .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
        .cancel-btn { padding: 12px 24px; background: #f5f5f5; border: none; border-radius: 4px; cursor: pointer; }
        .submit-btn { padding: 12px 24px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .submit-btn:disabled { background: #ccc; }
      `}</style>
    </div>
  );
}

export default BudgetForm;
