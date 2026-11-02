const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

const URL_ROLE = process.env.URL_MSM_ROLE || 'http://127.0.0.1:6004';
const URL_JABATAN = process.env.URL_MSM_JABATAN || 'http://127.0.0.1:6005';
const URL_STATUS_WORK = process.env.URL_MSM_STATUS_WORK || 'http://127.0.0.1:6006';
const URL_STATUS_EMP = process.env.URL_MSM_STATUS_EMPLOYEE || 'http://127.0.0.1:6007';

class MasterClient {
  async getAllMasters() {
    const [rolesRes, jabatansRes, statusWorksRes, statusEmpsRes] = await Promise.all([
      axios.get(`${URL_ROLE}/roles`, { timeout: 5000 }),
      axios.get(`${URL_JABATAN}/jabatans`, { timeout: 5000 }),
      axios.get(`${URL_STATUS_WORK}/status-works`, { timeout: 5000 }),
      axios.get(`${URL_STATUS_EMP}/status-employees`, { timeout: 5000 }),
    ]);

    return {
      divisions: rolesRes.data,
      jabatans: jabatansRes.data,
      statusWorks: statusWorksRes.data,
      statusEmployees: statusEmpsRes.data,
    };
  }
}

module.exports = { MasterClient };
