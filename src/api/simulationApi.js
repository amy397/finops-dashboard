import api from './costApi';

export const getScenarios = () => {
  return api.get('/simulation/scenarios');
};

export const getScenarioById = (id) => {
  return api.get(`/simulation/scenarios/${id}`);
};

export const calculateCost = (data) => {
  return api.post('/simulation/calculate', data);
};

export const createScenario = (data) => {
  return api.post('/simulation/scenarios', data);
};

export const deleteScenario = (id) => {
  return api.delete(`/simulation/scenarios/${id}`);
};

export const getPricingData = () => {
  return api.get('/simulation/pricing');
};
