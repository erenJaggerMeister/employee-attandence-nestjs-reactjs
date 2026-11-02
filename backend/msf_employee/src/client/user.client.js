const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

const MSM_USER_URL = process.env.URL_MSM_USER || 'http://127.0.0.1:6001';

class UserClient {
  async createUser(data) {
    const res = await axios.post(`${MSM_USER_URL}/users`, data, { timeout: 5000 });
    return res.data;
  }
}

module.exports = { UserClient };
