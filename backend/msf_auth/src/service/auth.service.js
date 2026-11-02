const { Injectable, UnauthorizedException, BadRequestException } = require('@nestjs/common');
const bcrypt = require('bcryptjs');
const { JwtHelper } = require('../../../common/jwt.helper');
const { UserClient } = require('../client/user.client');
const { EmployeeClient } = require('../client/employee.client');
const { AuthMapper } = require('../mapper/auth.mapper');

@Injectable()
class AuthService {
  constructor() {
    this.userClient = new UserClient();
    this.employeeClient = new EmployeeClient();
  }

  async login(loginDto) {
    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('Email dan password wajib diisi');
    }

    const userWithPassword = await this.userClient.getUserByEmail(loginDto.email, true);
    if (!userWithPassword) {
      throw new UnauthorizedException('Kredensial login tidak valid');
    }

    const isMatch = await bcrypt.compare(loginDto.password, userWithPassword.password);
    if (!isMatch) {
      throw new UnauthorizedException('Kredensial login tidak valid');
    }

    const employee = await this.employeeClient.getEmployeeByUserId(userWithPassword.id);

    const tokenPayload = {
      sub: userWithPassword.id,
      userId: userWithPassword.id,
      employeeId: employee ? employee.id : null,
      email: userWithPassword.email,
      nama: userWithPassword.nama,
      role: userWithPassword.role,
    };

    const accessToken = JwtHelper.sign(tokenPayload);
    return AuthMapper.toLoginResponse(userWithPassword, employee, accessToken);
  }

  async getProfile(userId) {
    const user = await this.userClient.getUserById(userId);
    const employee = await this.employeeClient.getEmployeeByUserId(userId);
    return {
      user,
      employee,
    };
  }
}

module.exports = { AuthService };
