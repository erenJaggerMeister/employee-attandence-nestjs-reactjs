const { Injectable } = require('@nestjs/common');
const { pool } = require('../../../common/db');
const { RoleMapper } = require('../mapper/role.mapper');

@Injectable()
class RoleService {
  async findAll() {
    const res = await pool.query(`SELECT * FROM roles_division ORDER BY nama ASC;`);
    return RoleMapper.toResponseList(res.rows);
  }

  async findById(id) {
    const res = await pool.query(`SELECT * FROM roles_division WHERE id = $1;`, [id]);
    return RoleMapper.toResponse(res.rows[0]);
  }

  async create(dto) {
    const res = await pool.query(
      `INSERT INTO roles_division (kode, nama) VALUES ($1, $2) RETURNING *;`,
      [dto.kode, dto.nama]
    );
    return RoleMapper.toResponse(res.rows[0]);
  }
}

module.exports = { RoleService };
