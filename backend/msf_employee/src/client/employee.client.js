const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

const MSM_EMPLOYEE_URL = process.env.URL_MSM_EMPLOYEE || 'http://127.0.0.1:6002';

class EmployeeClient {
  async getEmployees(params) {
    const res = await axios.get(`${MSM_EMPLOYEE_URL}/employees`, { params, timeout: 5000 });
    return res.data;
  }

  async getEmployeeById(id) {
    const res = await axios.get(`${MSM_EMPLOYEE_URL}/employees/${id}`, { timeout: 5000 });
    return res.data;
  }

  async createEmployee(data) {
    const res = await axios.post(`${MSM_EMPLOYEE_URL}/employees`, data, { timeout: 10000 });
    return res.data;
  }

  async updateEmployee(id, data) {
    const res = await axios.put(`${MSM_EMPLOYEE_URL}/employees/${id}`, data, { timeout: 10000 });
    return res.data;
  }
}

module.exports = { EmployeeClient };
