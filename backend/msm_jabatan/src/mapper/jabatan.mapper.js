class JabatanMapper {
  static toResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      kode: row.kode,
      nama: row.nama,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static toResponseList(rows) {
    return (rows || []).map(r => this.toResponse(r));
  }
}

module.exports = { JabatanMapper };
