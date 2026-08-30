import axios from 'axios';

const BASE_URL = 'https://aashray-backend-ir1k.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Automatically inject token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getIncidents = async () => {
  const res = await api.get('/incidents');
  return res.data;
};

export const getIncident = async (id) => {
  const res = await api.get(`/incidents/${id}`);
  return res.data;
};

export const createIncidentForm = async (formData) => {
  // formData is a FormData object containing file + inputs
  const res = await api.post('/incidents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const createIncidentJson = async (payload) => {
  const res = await api.post('/incidents/json', payload);
  return res.data;
};

export const updateIncidentStatus = async (id, status) => {
  const res = await api.patch(`/incidents/${id}`, { status });
  return res.data;
};

export const getResources = async () => {
  const res = await api.get('/resources');
  return res.data;
};

export const updateRescueTeamStatus = async (id, status) => {
  const res = await api.patch(`/rescue-teams/${id}/status`, { status });
  return res.data;
};

export const updateShelterOccupancy = async (id, payload) => {
  const res = await api.patch(`/shelters/${id}`, payload);
  return res.data;
};

export const updateSupplyStock = async (id, payload) => {
  const res = await api.patch(`/supply-depots/${id}`, payload);
  return res.data;
};

export const getAlerts = async () => {
  const res = await api.get('/alerts');
  return res.data;
};

export const getRecommendation = async (incidentId, resourceType, supplyType = 'water') => {
  const res = await api.post('/allocation/recommend?supply_type=' + supplyType, {
    incident_id: incidentId,
    resource_type: resourceType,
  });
  return res.data;
};

export const assignResource = async (incidentId, resourceType, resourceId) => {
  const res = await api.post('/allocation/assign', {
    incident_id: incidentId,
    resource_type: resourceType,
    resource_id: resourceId,
  });
  return res.data;
};

export const getAssignments = async () => {
  const res = await api.get('/allocation/assignments');
  return res.data;
};

// Simulation Triggers
export const triggerMockSMS = async (message, fromPhone) => {
  const res = await api.post('/sms/webhook', { message, from_phone: fromPhone });
  return res.data;
};

export const triggerMockIVR = async (payload) => {
  const res = await api.post('/ivr/webhook', payload);
  return res.data;
};
