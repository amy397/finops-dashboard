import api from './costApi';

export const getResources = (page = 0, size = 20) => {
  return api.get('/resources', { params: { page, size } });
};

export const getResourcesByType = (type, page = 0, size = 20) => {
  return api.get(`/resources/${type.toLowerCase()}`, { params: { page, size } });
};

export const getResourceById = (resourceId) => {
  return api.get(`/resources/${encodeURIComponent(resourceId)}`);
};

export const getIdleResources = () => {
  return api.get('/resources/idle');
};

export const getResourceSummary = () => {
  return api.get('/resources/summary');
};

export const syncResources = () => {
  return api.post('/resources/sync');
};

export const syncResourcesByType = (type) => {
  return api.post(`/resources/sync/${type.toLowerCase()}`);
};
