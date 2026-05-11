import api from './api';

export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const changePassword = (data) => api.put('/users/password', data);
export const searchUsers = (q, projectId) => api.get('/users/search', { params: { q, projectId } });
export const getDashboard = () => api.get('/dashboard');
