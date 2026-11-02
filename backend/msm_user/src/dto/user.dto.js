class CreateUserDto {
  constructor({ nama, email, password, role }) {
    this.nama = nama;
    this.email = email;
    this.password = password;
    this.role = role || 'EMPLOYEE';
  }
}

module.exports = { CreateUserDto };
