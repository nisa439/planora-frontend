import api from './api';

export const getTasks = (projectId, params) => api.get(`/tasks/project/${projectId}`, { params });
export const getMyTasks = (params) => api.get('/tasks/my', { params });
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const moveTask = (id, data) => api.patch(`/tasks/${id}/move`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
