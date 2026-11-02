const { Injectable } = require('@nestjs/common');
const { pool } = require('../../../common/db');
const { StatusEmployeeMapper } = require('../mapper/status-employee.mapper');

@Injectable()
class StatusEmployeeService {
  async findAll() {
    const res = await pool.query(`SELECT * FROM status_employees ORDER BY nama ASC;`);
    return StatusEmployeeMapper.toResponseList(res.rows);
  }

  async findById(id) {
    const res = await pool.query(`SELECT * FROM status_employees WHERE id = $1;`, [id]);
    return StatusEmployeeMapper.toResponse(res.rows[0]);
  }
}

module.exports = { StatusEmployeeService };
