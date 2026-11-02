class CreateEmployeeDto {
  constructor(data) {
    this.userId = data.userId;
    this.nik = data.nik;
    this.namaLengkap = data.namaLengkap;
    this.photoProfile = data.photoProfile || null;
    this.statusEmployeeId = data.statusEmployeeId;
    this.tanggalLahir = data.tanggalLahir;
    this.tanggalMasuk = data.tanggalMasuk;
    this.tinggiBadan = data.tinggiBadan;
    this.beratBadan = data.beratBadan;
    this.golonganDarah = data.golonganDarah;
    this.statusWorkId = data.statusWorkId;
    this.tanggalMulaiKontrak = data.tanggalMulaiKontrak || null;
    this.tanggalAkhirKontrak = data.tanggalAkhirKontrak || null;
    this.roleDivisionId = data.roleDivisionId;
    this.jabatanId = data.jabatanId;
  }
}

class UpdateEmployeeDto {
  constructor(data) {
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

module.exports = { CreateEmployeeDto, UpdateEmployeeDto };
