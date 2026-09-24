// ==========================================================
// API CLIENT SERVICE
// Manages HTTP requests, JWT token injection, and response parsing
// ==========================================================

const API_BASE = '/api/v1';

export const getToken = () => localStorage.getItem('smart_food_token');
export const setToken = (token) => localStorage.setItem('smart_food_token', token);
export const removeToken = () => localStorage.removeItem('smart_food_token');

export const getStoredUser = () => {
  const user = localStorage.getItem('smart_food_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
};
export const setStoredUser = (user) => localStorage.setItem('smart_food_user', JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem('smart_food_user');

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401) {
    // If unauthorized, clean stored credentials and dispatch event to update AuthContext
    removeToken();
    removeStoredUser();
    if (!endpoint.includes('/auth/login')) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = data.detail || (typeof data === 'string' ? data : 'An error occurred with the request');
    if (errorMsg === 'Not authenticated' || errorMsg === 'Could not validate credentials') {
      errorMsg = 'Your session has expired. Please log in again.';
    }
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getAllUsers: (role) => request(`/auth/users${role ? `?role=${role}` : ''}`),
  toggleUserActive: (userId) => request(`/auth/users/${userId}/toggle-active`, { method: 'PUT' }),

  // Donations
  createDonation: (data) => request('/donations/', { method: 'POST', body: JSON.stringify(data) }),
  getAvailableDonations: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.is_veg !== undefined && params.is_veg !== '') query.append('is_veg', params.is_veg);
    if (params.search) query.append('search', params.search);
    return request(`/donations/available?${query.toString()}`);
  },
  getMyDonations: () => request('/donations/my-donations'),
  getAllDonationsAdmin: (status) => request(`/donations/all${status ? `?status=${status}` : ''}`),
  getDonationById: (id) => request(`/donations/${id}`),
  updateDonation: (id, data) => request(`/donations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  acceptDonation: (id) => request(`/donations/${id}/accept`, { method: 'POST' }),
  updateDonationStatus: (id, status) => request(`/donations/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  cancelDonation: (id) => request(`/donations/${id}`, { method: 'DELETE' }),

  // Food Requests
  createFoodRequest: (data) => request('/requests/', { method: 'POST', body: JSON.stringify(data) }),
  getMyRequests: () => request('/requests/my-requests'),
  getActiveRequests: (status) => request(`/requests/active${status ? `?status_filter=${status}` : ''}`),
  getFoodRequest: (id) => request(`/requests/${id}`),
  updateFoodRequest: (id, data) => request(`/requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelFoodRequest: (id) => request(`/requests/${id}`, { method: 'DELETE' }),

  // Pickups
  createPickup: (data) => request('/pickups/', { method: 'POST', body: JSON.stringify(data) }),
  getMyPickups: () => request('/pickups/my-pickups'),
  getPickupById: (id) => request(`/pickups/${id}`),
  updatePickupStatus: (id, status) => request(`/pickups/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Distribution
  recordDistribution: (data) => request('/distribution/', { method: 'POST', body: JSON.stringify(data) }),
  getDistributionRecords: () => request('/distribution/records'),

  // Analytics
  getSummary: () => request('/analytics/summary'),
  getPublicCounters: () => request('/analytics/public-counters'),

  // Notifications
  getNotifications: () => request('/notifications/'),
  getUnreadCount: () => request('/notifications/unread-count'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // AI / ML Endpoints
  matchDonationsForRequest: (requestId) => request(`/ml/match/request/${requestId}`),
  getNearbyDonations: (lat, lon, maxDistance = 25.0) => request(`/ml/nearby-donations?lat=${lat}&lon=${lon}&max_distance_km=${maxDistance}`),
  getWeeklyForecast: () => request('/demand/prediction/weekly'),
  recommendMatches: (data) => request('/matching/recommend', { method: 'POST', body: JSON.stringify(data) }),
  getMatchesForDonation: (donationId) => request(`/matching/${donationId}`),
  getNgoRecommendedDonations: () => request('/matching/ngo/recommended'),
  getDemandPrediction: (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/demand/prediction?${query.toString()}`);
  },
  getDemandAnalytics: () => request('/analytics/demand'),
  getDonationsPriority: () => request('/donations/priority'),
  getModelMetrics: () => request('/demand/metrics'),
};
