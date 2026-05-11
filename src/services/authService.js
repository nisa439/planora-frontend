import api from './api';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const refresh = (refreshToken) => api.post('/auth/refresh', { refreshToken });
