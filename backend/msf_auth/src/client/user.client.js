const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

const MSM_USER_URL = process.env.URL_MSM_USER || 'http://127.0.0.1:6001';

class UserClient {
  async getUserByEmail(email, includePassword = false) {
    try {
      const res = await axios.get(`${MSM_USER_URL}/users/by-email`, {
        params: { email, auth: includePassword ? 'true' : 'false' },
        timeout: 5000,
      });
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 404) return null;
      throw err;
    }
  }

  async getUserById(id) {
    const res = await axios.get(`${MSM_USER_URL}/users/${id}`, { timeout: 5000 });
    return res.data;
  }
}

module.exports = { UserClient };
