const { Injectable } = require('@nestjs/common');
const { pool } = require('../../../common/db');
const { StatusWorkMapper } = require('../mapper/status-work.mapper');

@Injectable()
class StatusWorkService {
  async findAll() {
    const res = await pool.query(`SELECT * FROM status_works ORDER BY nama ASC;`);
    return StatusWorkMapper.toResponseList(res.rows);
  }

  async findById(id) {
    const res = await pool.query(`SELECT * FROM status_works WHERE id = $1;`, [id]);
    return StatusWorkMapper.toResponse(res.rows[0]);
  }
}

module.exports = { StatusWorkService };
