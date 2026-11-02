const { Injectable, BadRequestException, NotFoundException } = require('@nestjs/common');
const bcrypt = require('bcryptjs');
const { pool } = require('../../../common/db');
const { UserMapper } = require('../mapper/user.mapper');

@Injectable()
class UserService {
  async findByEmail(email, includePassword = false) {
    const res = await pool.query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1);`, [email]);
    if (res.rows.length === 0) return null;
    return UserMapper.toResponse(res.rows[0], includePassword);
  }

  async findById(id) {
    const res = await pool.query(`SELECT * FROM users WHERE id = $1;`, [id]);
    if (res.rows.length === 0) throw new NotFoundException('User not found');
    return UserMapper.toResponse(res.rows[0]);
  }

  async create(dto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password || 'password123', 10);
    const res = await pool.query(
      `INSERT INTO users (nama, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [dto.nama, dto.email, passwordHash, dto.role || 'EMPLOYEE']
    );
    return UserMapper.toResponse(res.rows[0]);
  }
}

module.exports = { UserService };
