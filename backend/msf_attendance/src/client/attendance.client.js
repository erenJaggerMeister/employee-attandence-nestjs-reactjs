const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

const MSM_ATTENDANCE_URL = process.env.URL_MSM_ATTENDANCE || 'http://127.0.0.1:6003';

class AttendanceClient {
  async checkIn(data) {
    const res = await axios.post(`${MSM_ATTENDANCE_URL}/attendances/check-in`, data, { timeout: 10000 });
    return res.data;
  }

  async checkOut(data) {
    const res = await axios.post(`${MSM_ATTENDANCE_URL}/attendances/check-out`, data, { timeout: 10000 });
    return res.data;
  }

  async getToday(employeeId) {
    try {
      const res = await axios.get(`${MSM_ATTENDANCE_URL}/attendances/today/${employeeId}`, { timeout: 5000 });
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 404) return null;
      throw err;
    }
  }

  async getEmployeeHistory(employeeId) {
    const res = await axios.get(`${MSM_ATTENDANCE_URL}/attendances/employee/${employeeId}`, { timeout: 5000 });
    return res.data;
  }

  async getAllAttendances() {
    const res = await axios.get(`${MSM_ATTENDANCE_URL}/attendances/all`, { timeout: 5000 });
    return res.data;
  }
}

module.exports = { AttendanceClient };
