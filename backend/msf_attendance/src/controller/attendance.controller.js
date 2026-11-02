const { Controller, Get, Post, Param, Body, Req, Res, UseGuards, Inject } = require('@nestjs/common');
const { AttendanceGatewayService } = require('../service/attendance-gateway.service');
const { JwtAuthGuard, RoleGuard } = require('../../../common/auth.guard');

const HrdOnlyGuard = RoleGuard('HRD');

@Controller('api/msf_attendance')
class AttendanceController {
  constructor(@Inject(AttendanceGatewayService) attendanceGatewayService) {
    this.attendanceGatewayService = attendanceGatewayService;
  }

  @UseGuards(JwtAuthGuard)
  @Get('today-status')
  async getTodayStatus(@Req() req) {
    return this.attendanceGatewayService.getTodayStatus(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('check-in')
  async checkIn(@Req() req, @Body() body) {
    return this.attendanceGatewayService.checkIn(req.user, body.photo);
  }

  @UseGuards(JwtAuthGuard)
  @Post('check-out')
  async checkOut(@Req() req, @Body() body) {
    return this.attendanceGatewayService.checkOut(req.user, body.photo);
  }

  // Sesuai kebutuhan user: /api/msf_attendance/user/{userId} dengan Bearer Token JWT
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserHistory(@Req() req, @Param('userId') userId) {
    return this.attendanceGatewayService.getUserHistory(req.user, userId);
  }

  // Khusus HRD: Riwayat Absensi Perusahaan
  @UseGuards(HrdOnlyGuard)
  @Get('company-history')
  async getCompanyHistory() {
    return this.attendanceGatewayService.getCompanyHistory();
  }

  // Khusus HRD: Export Excel Multi-Sheet + 2 Bar Chart
  @UseGuards(HrdOnlyGuard)
  @Get('export-excel')
  async exportExcel(@Res() res) {
    const workbook = await this.attendanceGatewayService.getExcelWorkbook();
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const filename = `Attendance_Report_DexaGroup_${dateStr}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  }
}

AttendanceController.parameters = [AttendanceGatewayService];

module.exports = { AttendanceController };
