const { Injectable, BadRequestException } = require('@nestjs/common');
const { EmployeeClient } = require('../client/employee.client');
const { UserClient } = require('../client/user.client');
const { MasterClient } = require('../client/master.client');
const { EmployeeGridMapper } = require('../mapper/employee-grid.mapper');

@Injectable()
class EmployeeGatewayService {
  constructor() {
    this.employeeClient = new EmployeeClient();
    this.userClient = new UserClient();
    this.masterClient = new MasterClient();
  }

  async getGrid(params) {
    const limit = parseInt(params.limit || '9', 10);
    const page = parseInt(params.page || '1', 10);
    const paginated = await this.employeeClient.getEmployees({
      search: params.search,
      divisionId: params.divisionId,
      page,
      limit,
    });
    return EmployeeGridMapper.toGridResponse(paginated);
  }

  async getDetail(id) {
    return this.employeeClient.getEmployeeById(id);
  }

  async createEmployeeWithUser(dto) {
    if (!dto.email || !dto.nik || !dto.namaLengkap) {
      throw new BadRequestException('Email, NIK, dan Nama Lengkap wajib diisi');
    }

    // 1. Buat User Account di msm_user
    const newUser = await this.userClient.createUser({
      nama: dto.namaLengkap,
      email: dto.email,
      password: dto.password || 'password123',
      role: 'EMPLOYEE',
    });

    // 2. Buat profil Employee di msm_employee
    const newEmployee = await this.employeeClient.createEmployee({
      userId: newUser.id,
      nik: dto.nik,
      namaLengkap: dto.namaLengkap,
      photoProfile: dto.photoProfile,
      statusEmployeeId: dto.statusEmployeeId,
      tanggalLahir: dto.tanggalLahir,
      tanggalMasuk: dto.tanggalMasuk,
      tinggiBadan: dto.tinggiBadan,
      beratBadan: dto.beratBadan,
      golonganDarah: dto.golonganDarah,
      statusWorkId: dto.statusWorkId,
      tanggalMulaiKontrak: dto.tanggalMulaiKontrak,
      tanggalAkhirKontrak: dto.tanggalAkhirKontrak,
      roleDivisionId: dto.roleDivisionId,
      jabatanId: dto.jabatanId,
    });

    return newEmployee;
  }

  async updateEmployee(id, dto) {
    return this.employeeClient.updateEmployee(id, dto);
  }

  async getLookups() {
    return this.masterClient.getAllMasters();
  }
}

module.exports = { EmployeeGatewayService };
