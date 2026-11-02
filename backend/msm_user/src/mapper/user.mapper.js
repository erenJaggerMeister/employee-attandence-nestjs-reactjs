class UserMapper {
  static toResponse(row, includePassword = false) {
    if (!row) return null;
    const res = {
      id: row.id,
      nama: row.nama,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    if (includePassword) {
      res.password = row.password;
    }
    return res;
  }
}

module.exports = { UserMapper };
