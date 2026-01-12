import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDailyCosts = (startDate, endDate) => {
  return api.get('/costs/daily', { params: { startDate, endDate } });
};

export const getServiceCosts = (startDate, endDate) => {
  return api.get('/costs/services', { params: { startDate, endDate } });
};

export const getCostSummary = () => {
  return api.get('/dashboard/summary');
};

export const getAlerts = () => {
  return api.get('/alerts');
};

export default api;
