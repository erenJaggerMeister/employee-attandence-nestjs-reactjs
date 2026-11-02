const { Controller, Post, Get, Body, Req, UseGuards, Inject } = require('@nestjs/common');
const { AuthService } = require('../service/auth.service');
const { JwtAuthGuard } = require('../../../common/auth.guard');

@Controller('api/msf_auth')
class AuthController {
  constructor(@Inject(AuthService) authService) {
    this.authService = authService;
  }

  @Post('login')
  async login(@Body() body) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.userId);
  }
}

AuthController.parameters = [AuthService];

module.exports = { AuthController };
