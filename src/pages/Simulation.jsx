import React, { useState, useEffect } from 'react';
import { getScenarios, getScenarioById, calculateCost, createScenario, deleteScenario, getPricingData } from '../api/simulationApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function Simulation() {
  const [scenarios, setScenarios] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [currentScenario, setCurrentScenario] = useState({
    name: '',
    description: '',
    items: []
  });
  const [calculationResult, setCalculationResult] = useState(null);
  const [newItem, setNewItem] = useState({
    resourceType: 'EC2',
    instanceType: 't3.micro',
    region: 'ap-northeast-2',
    quantity: 1,
    hoursPerMonth: 730,
    storageGb: 0
  });

  const instanceTypes = {
    EC2: ['t3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge', 'm5.large', 'm5.xlarge', 'c5.large', 'c5.xlarge', 'r5.large'],
    RDS: ['db.t3.micro', 'db.t3.small', 'db.t3.medium', 'db.r5.large', 'db.r5.xlarge'],
    LAMBDA: ['128MB', '256MB', '512MB', '1024MB', '2048MB'],
    S3: ['STANDARD', 'INTELLIGENT_TIERING', 'GLACIER']
  };

  const regions = ['ap-northeast-2', 'us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scenariosRes, pricingRes] = await Promise.all([
        getScenarios(),
        getPricingData()
      ]);
      setScenarios(scenariosRes.data);
      setPricing(pricingRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setCurrentScenario(prev => ({
      ...prev,
      items: [...prev.items, { ...newItem, id: Date.now() }]
    }));
    setNewItem({
      resourceType: 'EC2',
      instanceType: 't3.micro',
      region: 'ap-northeast-2',
      quantity: 1,
      hoursPerMonth: 730,
      storageGb: 0
    });
  };

  const removeItem = (id) => {
    setCurrentScenario(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleCalculate = async () => {
    if (currentScenario.items.length === 0) return;
    setCalculating(true);
    try {
      // 프론트엔드 필드명을 백엔드 API 형식으로 변환
      const apiItems = currentScenario.items.map(item => ({
        serviceCode: item.resourceType,
        instanceType: item.instanceType,
        region: item.region,
        quantity: item.quantity,
        usageHoursPerMonth: item.hoursPerMonth,
        storageGb: item.storageGb
      }));
      const response = await calculateCost({ items: apiItems });

      // 백엔드 응답을 프론트엔드 형식으로 변환
      const data = response.data;
      setCalculationResult({
        totalMonthlyCost: data.projectedMonthlyCost,
        totalYearlyCost: data.projectedMonthlyCost * 12,
        itemCosts: data.itemCosts?.map(cost => ({
          resourceType: cost.serviceCode,
          instanceType: cost.instanceType,
          monthlyCost: cost.monthlyCost
        }))
      });
    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setCalculating(false);
    }
  };

  const [saving, setSaving] = useState(false);

  const handleSaveScenario = async () => {
    if (!currentScenario.name.trim()) {
      alert('시나리오 이름을 입력해주세요.');
      return;
    }
    if (currentScenario.items.length === 0) {
      alert('최소 하나의 리소스를 추가해주세요.');
      return;
    }
    setSaving(true);
    try {
      // 프론트엔드 필드명을 백엔드 API 형식으로 변환
      const apiItems = currentScenario.items.map(item => ({
        actionType: 'ADD',
        serviceCode: item.resourceType,
        resourceType: item.resourceType,
        instanceType: item.instanceType,
        region: item.region,
        quantity: Number(item.quantity),
        usageHoursPerMonth: Number(item.hoursPerMonth),
        storageGb: Number(item.storageGb) || 0
      }));
      await createScenario({
        name: currentScenario.name.trim(),
        description: currentScenario.description || '',
        items: apiItems
      });
      alert('시나리오가 저장되었습니다.');
      fetchData();
      setCurrentScenario({ name: '', description: '', items: [] });
      setCalculationResult(null);
    } catch (error) {
      console.error('Failed to save scenario:', error);
      alert('시나리오 저장에 실패했습니다: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScenario = async (id) => {
    if (window.confirm('Delete this scenario?')) {
      try {
        await deleteScenario(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete scenario:', error);
      }
    }
  };

  const handleLoadScenario = async (id) => {
    try {
      const response = await getScenarioById(id);
      const scenario = response.data;
      // 백엔드 형식을 프론트엔드 형식으로 변환
      const items = (scenario.items || []).map(item => ({
        id: Date.now() + Math.random(),
        resourceType: item.serviceCode || item.resourceType,
        instanceType: item.instanceType,
        region: item.region,
        quantity: item.quantity,
        hoursPerMonth: item.usageHoursPerMonth || 730,
        storageGb: item.storageGb || 0
      }));
      setCurrentScenario({
        name: scenario.name + ' (Copy)',
        description: scenario.description || '',
        items: items
      });
      setCalculationResult(null);
    } catch (error) {
      console.error('Failed to load scenario:', error);
    }
  };

  const getComparisonData = () => {
    return scenarios.map(s => ({
      name: s.name,
      monthlyCost: s.projectedMonthlyCost || s.totalMonthlyCost || 0
    }));
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="simulation-page">
      <div className="page-header">
        <h1>What-If Cost Simulation</h1>
      </div>

      <div className="simulation-layout">
        <div className="builder-section">
          <div className="section-card">
            <h2>Build Your Scenario</h2>

            <div className="scenario-info">
              <div className="input-group">
                <label>Scenario Name *</label>
                <input
                  type="text"
                  placeholder="Enter scenario name to save"
                  value={currentScenario.name}
                  onChange={(e) => setCurrentScenario(prev => ({ ...prev, name: e.target.value }))}
                  className={!currentScenario.name.trim() ? 'input-warning' : ''}
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Optional description"
                  value={currentScenario.description}
                  onChange={(e) => setCurrentScenario(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="add-resource">
              <h3>Add Resource</h3>
              <div className="resource-form">
                <select
                  value={newItem.resourceType}
                  onChange={(e) => setNewItem(prev => ({
                    ...prev,
                    resourceType: e.target.value,
                    instanceType: instanceTypes[e.target.value][0]
                  }))}
                >
                  <option value="EC2">EC2 Instance</option>
                  <option value="RDS">RDS Database</option>
                  <option value="LAMBDA">Lambda Function</option>
                  <option value="S3">S3 Storage</option>
                </select>

                <select
                  value={newItem.instanceType}
                  onChange={(e) => setNewItem(prev => ({ ...prev, instanceType: e.target.value }))}
                >
                  {instanceTypes[newItem.resourceType].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  value={newItem.region}
                  onChange={(e) => setNewItem(prev => ({ ...prev, region: e.target.value }))}
                >
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  placeholder="Qty"
                />

                {newItem.resourceType !== 'S3' && (
                  <input
                    type="number"
                    min="1"
                    max="730"
                    value={newItem.hoursPerMonth}
                    onChange={(e) => setNewItem(prev => ({ ...prev, hoursPerMonth: parseInt(e.target.value) || 730 }))}
                    placeholder="Hours/month"
                  />
                )}

                {(newItem.resourceType === 'S3' || newItem.resourceType === 'RDS') && (
                  <input
                    type="number"
                    min="0"
                    value={newItem.storageGb}
                    onChange={(e) => setNewItem(prev => ({ ...prev, storageGb: parseInt(e.target.value) || 0 }))}
                    placeholder="Storage (GB)"
                  />
                )}

                <button onClick={addItem} className="add-btn">+ Add</button>
              </div>
            </div>

            <div className="items-list">
              <h3>Resources ({currentScenario.items.length})</h3>
              {currentScenario.items.map((item) => (
                <div key={item.id} className="item-row">
                  <span className="item-type">{item.resourceType}</span>
                  <span className="item-details">
                    {item.instanceType} x {item.quantity} in {item.region}
                    {item.hoursPerMonth < 730 && ` (${item.hoursPerMonth}h/mo)`}
                    {item.storageGb > 0 && ` + ${item.storageGb}GB`}
                  </span>
                  <button onClick={() => removeItem(item.id)} className="remove-btn">×</button>
                </div>
              ))}
              {currentScenario.items.length === 0 && (
                <p className="empty-message">Add resources to calculate costs</p>
              )}
            </div>

            <div className="action-buttons">
              <button
                onClick={handleCalculate}
                disabled={calculating || currentScenario.items.length === 0}
                className="calculate-btn"
              >
                {calculating ? 'Calculating...' : 'Calculate Cost'}
              </button>
              <button
                onClick={handleSaveScenario}
                disabled={saving || !currentScenario.name.trim() || currentScenario.items.length === 0}
                className="save-scenario-btn"
              >
                {saving ? 'Saving...' : 'Save Scenario'}
              </button>
            </div>
          </div>

          {calculationResult && (
            <div className="section-card result-card">
              <h2>Cost Estimate</h2>
              <div className="cost-summary">
                <div className="cost-item main">
                  <span>Monthly Cost</span>
                  <span className="cost-value">${calculationResult.totalMonthlyCost?.toFixed(2)}</span>
                </div>
                <div className="cost-item">
                  <span>Yearly Cost</span>
                  <span className="cost-value">${calculationResult.totalYearlyCost?.toFixed(2)}</span>
                </div>
              </div>

              <div className="breakdown">
                <h3>Cost Breakdown</h3>
                {calculationResult.itemCosts?.map((cost, index) => (
                  <div key={index} className="breakdown-row">
                    <span>{cost.resourceType} - {cost.instanceType}</span>
                    <span>${cost.monthlyCost?.toFixed(2)}/mo</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveScenario}
                className="save-btn"
                disabled={saving || !currentScenario.name.trim()}
                title={!currentScenario.name.trim() ? '시나리오 이름을 먼저 입력하세요' : ''}
              >
                {saving ? 'Saving...' : !currentScenario.name.trim() ? 'Enter Name to Save' : 'Save Scenario'}
              </button>
            </div>
          )}
        </div>

        <div className="scenarios-section">
          <div className="section-card">
            <h2>Saved Scenarios</h2>

            {scenarios.length > 0 && (
              <div className="comparison-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={getComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                    <Bar dataKey="monthlyCost" fill="#1976d2" name="Monthly Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="scenarios-list">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="scenario-card">
                  <div className="scenario-header">
                    <h3>{scenario.name}</h3>
                    <div className="scenario-actions">
                      <button onClick={() => handleLoadScenario(scenario.id)} className="load-btn" title="Load scenario">↻</button>
                      <button onClick={() => handleDeleteScenario(scenario.id)} className="delete-btn" title="Delete scenario">×</button>
                    </div>
                  </div>
                  <p className="scenario-desc">{scenario.description || 'No description'}</p>
                  <div className="scenario-details">
                    <span>{scenario.items?.length || 0} resources</span>
                    <span className="scenario-cost">${(scenario.projectedMonthlyCost || scenario.totalMonthlyCost)?.toFixed(2)}/mo</span>
                  </div>
                </div>
              ))}
              {scenarios.length === 0 && (
                <p className="empty-message">No saved scenarios yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .simulation-page { padding: 20px; }
        .page-header { margin-bottom: 20px; }
        .simulation-layout { display: grid; grid-template-columns: 1fr 400px; gap: 20px; }
        .section-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .section-card h2 { margin-top: 0; margin-bottom: 20px; }
        .scenario-info { display: flex; gap: 10px; margin-bottom: 20px; }
        .scenario-info .input-group { flex: 1; }
        .scenario-info .input-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: #374151; }
        .scenario-info input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        .scenario-info input.input-warning { border-color: #f59e0b; background: #fffbeb; }
        .scenario-info input:focus { outline: none; border-color: #1976d2; }
        .add-resource h3 { margin-bottom: 10px; font-size: 14px; color: #666; }
        .resource-form { display: flex; flex-wrap: wrap; gap: 10px; padding: 15px; background: #f9fafb; border-radius: 4px; }
        .resource-form select, .resource-form input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .resource-form input { width: 80px; }
        .add-btn { padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .items-list { margin: 20px 0; }
        .items-list h3 { font-size: 14px; color: #666; margin-bottom: 10px; }
        .item-row { display: flex; align-items: center; gap: 10px; padding: 10px; background: #f9fafb; border-radius: 4px; margin-bottom: 8px; }
        .item-type { padding: 4px 8px; background: #e3f2fd; color: #1976d2; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .item-details { flex: 1; font-size: 14px; }
        .remove-btn { width: 24px; height: 24px; border: none; background: #fee2e2; color: #dc2626; border-radius: 50%; cursor: pointer; font-size: 16px; }
        .empty-message { color: #888; font-style: italic; text-align: center; padding: 20px; }
        .action-buttons { display: flex; gap: 10px; }
        .calculate-btn { flex: 1; padding: 12px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .calculate-btn:disabled { background: #ccc; }
        .save-scenario-btn { flex: 1; padding: 12px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .save-scenario-btn:disabled { background: #ccc; }
        .result-card { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; }
        .result-card h2 { color: white; }
        .cost-summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .cost-item { background: rgba(255,255,255,0.15); padding: 15px 20px; border-radius: 8px; }
        .cost-item.main { flex: 1; }
        .cost-item span:first-child { display: block; font-size: 13px; opacity: 0.9; margin-bottom: 5px; }
        .cost-value { font-size: 24px; font-weight: bold; }
        .breakdown { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-bottom: 15px; }
        .breakdown h3 { font-size: 14px; margin: 0 0 10px; opacity: 0.9; }
        .breakdown-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px; }
        .breakdown-row:last-child { border-bottom: none; }
        .save-btn { width: 100%; padding: 12px; background: white; color: #1976d2; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .comparison-chart { margin-bottom: 20px; }
        .scenarios-list { display: flex; flex-direction: column; gap: 10px; }
        .scenario-card { padding: 15px; background: #f9fafb; border-radius: 8px; }
        .scenario-header { display: flex; justify-content: space-between; align-items: center; }
        .scenario-header h3 { margin: 0; font-size: 16px; }
        .scenario-actions { display: flex; gap: 4px; }
        .load-btn { width: 28px; height: 28px; border: none; background: #e3f2fd; color: #1976d2; cursor: pointer; font-size: 16px; border-radius: 4px; }
        .load-btn:hover { background: #bbdefb; }
        .delete-btn { width: 28px; height: 28px; border: none; background: #fee2e2; color: #dc2626; cursor: pointer; font-size: 18px; border-radius: 4px; }
        .delete-btn:hover { background: #fecaca; }
        .scenario-desc { color: #666; font-size: 13px; margin: 8px 0; }
        .scenario-details { display: flex; justify-content: space-between; font-size: 13px; }
        .scenario-cost { font-weight: 600; color: #1976d2; }
        @media (max-width: 900px) {
          .simulation-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default Simulation;
