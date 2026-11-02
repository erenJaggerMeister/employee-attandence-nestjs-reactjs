class EmployeeFormDto {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.nik = data.nik;
    this.namaLengkap = data.namaLengkap;
    this.photoProfile = data.photoProfile;
    this.statusEmployeeId = data.statusEmployeeId;
    this.tanggalLahir = data.tanggalLahir;
    this.tanggalMasuk = data.tanggalMasuk;
    this.tinggiBadan = data.tinggiBadan;
    this.beratBadan = data.beratBadan;
    this.golonganDarah = data.golonganDarah;
    this.statusWorkId = data.statusWorkId;
    this.tanggalMulaiKontrak = data.tanggalMulaiKontrak;
    this.tanggalAkhirKontrak = data.tanggalAkhirKontrak;
    this.roleDivisionId = data.roleDivisionId;
    this.jabatanId = data.jabatanId;
  }
}

module.exports = { EmployeeFormDto };
