import api from './costApi';

export const getReports = (limit = 20) => {
  return api.get('/reports', { params: { limit } });
};

export const getReportById = (id) => {
  return api.get(`/reports/${id}`);
};

export const generateReport = (data) => {
  return api.post('/reports/generate', data);
};

export const downloadReport = async (id) => {
  const response = await api.get(`/reports/download/${id}`, {
    responseType: 'blob'
  });
  return response;
};
