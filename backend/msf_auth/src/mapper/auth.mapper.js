class AuthMapper {
  static toLoginResponse(user, employee, accessToken) {
    return {
      tokenType: 'Bearer',
      accessToken,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        employeeId: employee ? employee.id : null,
        nik: employee ? employee.nik : null,
        divisiName: employee ? employee.divisiName : null,
        jabatanName: employee ? employee.jabatanName : null,
        photoProfile: employee ? employee.photoProfile : null,
      },
    };
  }
}

module.exports = { AuthMapper };
