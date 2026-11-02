const ExcelJS = require('exceljs');
const { createBarChartBuffer } = require('./chart-generator');

class ExcelReportService {
  static async generateWorkbook(companyRecords) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Dexa Group HRMS - MSF Attendance';
    workbook.created = new Date();

    // ==========================================
    // SHEET 1: DATA RIWAYAT ABSENSI
    // ==========================================
    const sheet1 = workbook.addWorksheet('Data Riwayat Absensi', {
      views: [{ showGridLines: true }],
    });

    sheet1.columns = [
      { header: 'NIK Karyawan', key: 'nik', width: 22 },
      { header: 'Nama Karyawan', key: 'nama', width: 28 },
      { header: 'Divisi', key: 'divisi', width: 18 },
      { header: 'Jabatan', key: 'jabatan', width: 20 },
      { header: 'Jam Masuk', key: 'jamMasuk', width: 22 },
      { header: 'Jam Keluar', key: 'jamKeluar', width: 22 },
      { header: 'Durasi Kerja', key: 'durasi', width: 18 },
    ];

    // Styling Header
    const headerRow = sheet1.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' }, // Dexa Dark Blue
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true,
        size: 11,
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Add Rows
    companyRecords.forEach((record, index) => {
      const row = sheet1.addRow({
        nik: record.nik || '-',
        nama: record.namaLengkap || '-',
        divisi: record.divisi || '-',
        jabatan: record.jabatan || '-',
        jamMasuk: record.checkInTimeFormatted || '-',
        jamKeluar: record.checkOutTimeFormatted || '-',
        durasi: record.workDurationFormatted || '-',
      });

      row.height = 22;
      const isEven = index % 2 === 0;
      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        if (['nik', 'jamMasuk', 'jamKeluar', 'durasi'].includes(cell._column.key)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
        if (isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' },
          };
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });
    });

    // ==========================================
    // SHEET 2: GRAFIK & DISTRIBUSI KEHADIRAN
    // ==========================================
    const sheet2 = workbook.addWorksheet('Grafik Distribusi Kehadiran', {
      views: [{ showGridLines: true }],
    });

    // Agregasi Jam Masuk & Jam Keluar
    const checkInBuckets = { '07:00': 0, '08:00': 0, '09:00': 0, '10:00': 0, 'Lainnya': 0 };
    const checkOutBuckets = { '16:00': 0, '17:00': 0, '18:00': 0, '19:00': 0, 'Lainnya': 0 };

    companyRecords.forEach(r => {
      if (r.checkInTime) {
        const d = new Date(r.checkInTime);
        const hour = d.getHours();
        if (hour === 7) checkInBuckets['07:00']++;
        else if (hour === 8) checkInBuckets['08:00']++;
        else if (hour === 9) checkInBuckets['09:00']++;
        else if (hour === 10) checkInBuckets['10:00']++;
        else checkInBuckets['Lainnya']++;
      }
      if (r.checkOutTime) {
        const d = new Date(r.checkOutTime);
        const hour = d.getHours();
        if (hour === 16) checkOutBuckets['16:00']++;
        else if (hour === 17) checkOutBuckets['17:00']++;
        else if (hour === 18) checkOutBuckets['18:00']++;
        else if (hour === 19) checkOutBuckets['19:00']++;
        else checkOutBuckets['Lainnya']++;
      }
    });

    const inChartData = Object.entries(checkInBuckets).map(([k, v]) => ({ label: k, value: v }));
    const outChartData = Object.entries(checkOutBuckets).map(([k, v]) => ({ label: k, value: v }));

    // Generate Bar Chart 1 (Distribusi Jam Masuk)
    const inChartBuffer = createBarChartBuffer({
      title: 'Bar Chart 1: Distribusi Jam Masuk Karyawan',
      data: inChartData,
      width: 650,
      height: 320,
      barColor: [37, 99, 235], // Blue
    });
    const imageInId = workbook.addImage({
      buffer: inChartBuffer,
      extension: 'png',
    });

    // Generate Bar Chart 2 (Distribusi Jam Keluar)
    const outChartBuffer = createBarChartBuffer({
      title: 'Bar Chart 2: Distribusi Jam Keluar Karyawan',
      data: outChartData,
      width: 650,
      height: 320,
      barColor: [5, 150, 105], // Green
    });
    const imageOutId = workbook.addImage({
      buffer: outChartBuffer,
      extension: 'png',
    });

    // Tabel Ringkasan 1 di Sheet 2
    sheet2.getCell('A2').value = 'RINGKASAN DISTRIBUSI JAM MASUK (BAR CHART 1)';
    sheet2.getCell('A2').font = { bold: true, size: 12, color: { argb: 'FF1E3A8A' } };
    sheet2.getCell('A3').value = 'Jam Masuk';
    sheet2.getCell('B3').value = 'Total Karyawan';
    ['A3', 'B3'].forEach(c => {
      sheet2.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      sheet2.getCell(c).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet2.getCell(c).alignment = { horizontal: 'center' };
    });

    let rowIdx = 4;
    inChartData.forEach(item => {
      sheet2.getCell(`A${rowIdx}`).value = item.label;
      sheet2.getCell(`B${rowIdx}`).value = item.value;
      sheet2.getCell(`A${rowIdx}`).alignment = { horizontal: 'center' };
      sheet2.getCell(`B${rowIdx}`).alignment = { horizontal: 'center' };
      rowIdx++;
    });

    // Sematkan Bar Chart 1 di cell D2:N17
    sheet2.addImage(imageInId, {
      tl: { col: 3.5, row: 1.5 },
      ext: { width: 620, height: 300 },
    });

    // Tabel Ringkasan 2 di Sheet 2
    const startRow2 = 20;
    sheet2.getCell(`A${startRow2}`).value = 'RINGKASAN DISTRIBUSI JAM KELUAR (BAR CHART 2)';
    sheet2.getCell(`A${startRow2}`).font = { bold: true, size: 12, color: { argb: 'FF065F46' } };
    sheet2.getCell(`A${startRow2 + 1}`).value = 'Jam Keluar';
    sheet2.getCell(`B${startRow2 + 1}`).value = 'Total Karyawan';
    [`A${startRow2 + 1}`, `B${startRow2 + 1}`].forEach(c => {
      sheet2.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } };
      sheet2.getCell(c).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet2.getCell(c).alignment = { horizontal: 'center' };
    });

    let rowIdx2 = startRow2 + 2;
    outChartData.forEach(item => {
      sheet2.getCell(`A${rowIdx2}`).value = item.label;
      sheet2.getCell(`B${rowIdx2}`).value = item.value;
      sheet2.getCell(`A${rowIdx2}`).alignment = { horizontal: 'center' };
      sheet2.getCell(`B${rowIdx2}`).alignment = { horizontal: 'center' };
      rowIdx2++;
    });

    // Sematkan Bar Chart 2 di cell D19:N34
    sheet2.addImage(imageOutId, {
      tl: { col: 3.5, row: 19.5 },
      ext: { width: 620, height: 300 },
    });

    sheet2.getColumn('A').width = 16;
    sheet2.getColumn('B').width = 18;

    return workbook;
  }
}

module.exports = { ExcelReportService };
