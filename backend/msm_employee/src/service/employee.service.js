const { Injectable, NotFoundException, BadRequestException } = require('@nestjs/common');
const { pool } = require('../../../common/db');
const { EmployeeMapper } = require('../mapper/employee.mapper');

@Injectable()
class EmployeeService {
  async findAll({ search, divisionId, page = 1, limit = 9 } = {}) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`(e.nama_lengkap ILIKE $${params.length} OR e.nik ILIKE $${params.length})`);
    }

    if (divisionId) {
      params.push(divisionId);
      whereClauses.push(`e.role_division_id = $${params.length}`);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM employees e ${whereStr};`;
    const countRes = await pool.query(countQuery, params);
    const total = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const query = `
      SELECT 
        e.*,
        rd.nama AS divisi_name,
        j.nama AS jabatan_name,
        sw.nama AS status_work_name,
        se.nama AS status_employee_name
      FROM employees e
      LEFT JOIN roles_division rd ON e.role_division_id = rd.id
      LEFT JOIN jabatans j ON e.jabatan_id = j.id
      LEFT JOIN status_works sw ON e.status_work_id = sw.id
      LEFT JOIN status_employees se ON e.status_employee_id = se.id
      ${whereStr}
      ORDER BY e.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length};
    `;

    const res = await pool.query(query, params);
    return {
      data: EmployeeMapper.toResponseList(res.rows),
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id) {
    const query = `
      SELECT 
        e.*,
        rd.nama AS divisi_name,
        j.nama AS jabatan_name,
        sw.nama AS status_work_name,
        se.nama AS status_employee_name
      FROM employees e
      LEFT JOIN roles_division rd ON e.role_division_id = rd.id
      LEFT JOIN jabatans j ON e.jabatan_id = j.id
      LEFT JOIN status_works sw ON e.status_work_id = sw.id
      LEFT JOIN status_employees se ON e.status_employee_id = se.id
      WHERE e.id = $1;
    `;
    const res = await pool.query(query, [id]);
    if (res.rows.length === 0) throw new NotFoundException('Employee not found');
    return EmployeeMapper.toResponse(res.rows[0]);
  }

  async findByUserId(userId) {
    const query = `
      SELECT 
        e.*,
        rd.nama AS divisi_name,
        j.nama AS jabatan_name,
        sw.nama AS status_work_name,
        se.nama AS status_employee_name
      FROM employees e
      LEFT JOIN roles_division rd ON e.role_division_id = rd.id
      LEFT JOIN jabatans j ON e.jabatan_id = j.id
      LEFT JOIN status_works sw ON e.status_work_id = sw.id
      LEFT JOIN status_employees se ON e.status_employee_id = se.id
      WHERE e.user_id = $1;
    `;
    const res = await pool.query(query, [userId]);
    if (res.rows.length === 0) return null;
    return EmployeeMapper.toResponse(res.rows[0]);
  }

  async create(dto) {
    const existing = await pool.query(`SELECT id FROM employees WHERE nik = $1;`, [dto.nik]);
    if (existing.rows.length > 0) {
      throw new BadRequestException('NIK already registered');
    }

    const query = `
      INSERT INTO employees (
        user_id, nik, nama_lengkap, photo_profile,
        status_employee_id, tanggal_lahir, tanggal_masuk,
        tinggi_badan, berat_badan, golongan_darah,
        status_work_id, tanggal_mulai_kontrak, tanggal_akhir_kontrak,
        role_division_id, jabatan_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;

    const values = [
      dto.userId,
      dto.nik,
      dto.namaLengkap,
      dto.photoProfile,
      dto.statusEmployeeId,
      dto.tanggalLahir,
      dto.tanggalMasuk,
      dto.tinggiBadan,
      dto.beratBadan,
      dto.golonganDarah,
      dto.statusWorkId,
      dto.tanggalMulaiKontrak || null,
      dto.tanggalAkhirKontrak || null,
      dto.roleDivisionId,
      dto.jabatanId,
    ];

    const res = await pool.query(query, values);
    return this.findById(res.rows[0].id);
  }

  async update(id, dto) {
    await this.findById(id);

    const query = `
      UPDATE employees
      SET 
        nama_lengkap = COALESCE($1, nama_lengkap),
        photo_profile = COALESCE($2, photo_profile),
        status_employee_id = COALESCE($3, status_employee_id),
        tanggal_lahir = COALESCE($4, tanggal_lahir),
        tanggal_masuk = COALESCE($5, tanggal_masuk),
        tinggi_badan = COALESCE($6, tinggi_badan),
        berat_badan = COALESCE($7, berat_badan),
        golongan_darah = COALESCE($8, golongan_darah),
        status_work_id = COALESCE($9, status_work_id),
        tanggal_mulai_kontrak = $10,
        tanggal_akhir_kontrak = $11,
        role_division_id = COALESCE($12, role_division_id),
        jabatan_id = COALESCE($13, jabatan_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *;
    `;

    const values = [
      dto.namaLengkap,
      dto.photoProfile,
      dto.statusEmployeeId,
      dto.tanggalLahir,
      dto.tanggalMasuk,
      dto.tinggiBadan,
      dto.beratBadan,
      dto.golonganDarah,
      dto.statusWorkId,
      dto.tanggalMulaiKontrak || null,
      dto.tanggalAkhirKontrak || null,
      dto.roleDivisionId,
      dto.jabatanId,
      id,
    ];

    await pool.query(query, values);
    return this.findById(id);
  }
}

module.exports = { EmployeeService };
