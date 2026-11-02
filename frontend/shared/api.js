import axios from 'axios';

export const URLS = {
  AUTH: 'http://127.0.0.1:5000/api/msf_auth',
  EMPLOYEE: 'http://127.0.0.1:5001/api/msf_employee',
  ATTENDANCE: 'http://127.0.0.1:5002/api/msf_attendance',
};

// Local storage key for Bearer Token
const TOKEN_KEY = 'dexa_hrms_bearer_token';
const USER_KEY = 'dexa_hrms_user_profile';

export const AuthService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const getAuthHeaders = () => {
  const token = AuthService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API Methods
export const api = {
  // msf_auth
  login: async (email, password) => {
    const res = await axios.post(`${URLS.AUTH}/login`, { email, password });
    return res.data;
  },
  getProfile: async () => {
    const res = await axios.get(`${URLS.AUTH}/profile`, { headers: getAuthHeaders() });
    return res.data;
  },

  // msf_attendance
  getTodayStatus: async () => {
    const res = await axios.get(`${URLS.ATTENDANCE}/today-status`, { headers: getAuthHeaders() });
    return res.data;
  },
  checkIn: async (photoBase64) => {
    const res = await axios.post(
      `${URLS.ATTENDANCE}/check-in`,
      { photo: photoBase64 },
      { headers: getAuthHeaders() }
    );
    return res.data;
  },
  checkOut: async (photoBase64) => {
    const res = await axios.post(
      `${URLS.ATTENDANCE}/check-out`,
      { photo: photoBase64 },
      { headers: getAuthHeaders() }
    );
    return res.data;
  },
  // Endpoint spesifik user: /api/msf_attendance/user/{userId} dengan Bearer Token
  getUserAttendanceHistory: async (userId) => {
    const res = await axios.get(`${URLS.ATTENDANCE}/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },
  getCompanyHistory: async () => {
    const res = await axios.get(`${URLS.ATTENDANCE}/company-history`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },
  exportExcelUrl: () => `${URLS.ATTENDANCE}/export-excel`,

  // msf_employee (HRD Only)
  getEmployeeGrid: async (params = {}) => {
    const res = await axios.get(`${URLS.EMPLOYEE}/grid`, {
      params,
      headers: getAuthHeaders(),
    });
    return res.data;
  },
  getEmployeeDetail: async (id) => {
    const res = await axios.get(`${URLS.EMPLOYEE}/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },
  createEmployee: async (data) => {
    const res = await axios.post(`${URLS.EMPLOYEE}`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },
  updateEmployee: async (id, data) => {
    const res = await axios.put(`${URLS.EMPLOYEE}/${id}`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },
  getLookups: async () => {
    const res = await axios.get(`${URLS.EMPLOYEE}/lookup/masters`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },
};
