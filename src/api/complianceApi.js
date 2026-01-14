import api from './costApi';

export const getPolicies = () => {
  return api.get('/tag-compliance/policies');
};

export const getPolicyById = (id) => {
  return api.get(`/tag-compliance/policies/${id}`);
};

export const createPolicy = (data) => {
  return api.post('/tag-compliance/policies', data);
};

export const updatePolicy = (id, data) => {
  return api.put(`/tag-compliance/policies/${id}`, data);
};

export const deletePolicy = (id) => {
  return api.delete(`/tag-compliance/policies/${id}`);
};

export const runComplianceScan = () => {
  return api.post('/tag-compliance/scan');
};

export const getRecentScans = (limit = 10) => {
  return api.get('/tag-compliance/scans', { params: { limit } });
};

export const getScanById = (id) => {
  return api.get(`/tag-compliance/scans/${id}`);
};

export const getComplianceScore = () => {
  return api.get('/tag-compliance/score');
};

export const getNonCompliantResources = (page = 0, size = 50) => {
  return api.get('/tag-compliance/non-compliant', { params: { page, size } });
};
