const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

const MSM_EMPLOYEE_URL = process.env.URL_MSM_EMPLOYEE || 'http://127.0.0.1:6002';

class EmployeeClient {
  async getEmployeeByUserId(userId) {
    try {
      const res = await axios.get(`${MSM_EMPLOYEE_URL}/employees/by-user/${userId}`, { timeout: 5000 });
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 404) return null;
      return null;
    }
  }
}

module.exports = { EmployeeClient };
