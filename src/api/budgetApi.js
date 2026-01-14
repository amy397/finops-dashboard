import api from './costApi';

export const getBudgets = () => {
  return api.get('/budgets');
};

export const getBudgetById = (id) => {
  return api.get(`/budgets/${id}`);
};

export const createBudget = (data) => {
  return api.post('/budgets', data);
};

export const updateBudget = (id, data) => {
  return api.put(`/budgets/${id}`, data);
};

export const deleteBudget = (id) => {
  return api.delete(`/budgets/${id}`);
};

export const getBudgetUsage = (id) => {
  return api.get(`/budgets/${id}/usage`);
};

export const getBudgetAlerts = (id) => {
  return api.get(`/budgets/${id}/alerts`);
};

export const getBudgetDashboard = () => {
  return api.get('/budgets/dashboard');
};
