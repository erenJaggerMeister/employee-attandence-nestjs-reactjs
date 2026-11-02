class EmployeeGridMapper {
  static toGridCard(item) {
    return {
      id: item.id,
      nik: item.nik,
      namaLengkap: item.namaLengkap,
      photoProfile: item.photoProfile,
      divisiName: item.divisiName,
      jabatanName: item.jabatanName,
      statusEmployeeName: item.statusEmployeeName,
      statusWorkName: item.statusWorkName,
    };
  }

  static toGridResponse(paginatedResult) {
    return {
      cards: paginatedResult.data.map(item => this.toGridCard(item)),
      total: paginatedResult.total,
      page: paginatedResult.page,
      limit: paginatedResult.limit,
      totalPages: paginatedResult.totalPages,
    };
  }
}

module.exports = { EmployeeGridMapper };
