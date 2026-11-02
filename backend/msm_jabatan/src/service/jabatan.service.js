const { Injectable } = require('@nestjs/common');
const { pool } = require('../../../common/db');
const { JabatanMapper } = require('../mapper/jabatan.mapper');

@Injectable()
class JabatanService {
  async findAll() {
    const res = await pool.query(`SELECT * FROM jabatans ORDER BY nama ASC;`);
    return JabatanMapper.toResponseList(res.rows);
  }

  async findById(id) {
    const res = await pool.query(`SELECT * FROM jabatans WHERE id = $1;`, [id]);
    return JabatanMapper.toResponse(res.rows[0]);
  }

  async create(dto) {
    const res = await pool.query(
      `INSERT INTO jabatans (kode, nama) VALUES ($1, $2) RETURNING *;`,
      [dto.kode, dto.nama]
    );
    return JabatanMapper.toResponse(res.rows[0]);
  }
}

module.exports = { JabatanService };
