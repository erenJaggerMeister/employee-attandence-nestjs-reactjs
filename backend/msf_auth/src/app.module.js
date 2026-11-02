const { Module } = require('@nestjs/common');
const { AuthController } = require('./controller/auth.controller');
const { AuthService } = require('./service/auth.service');

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
class AppModule {}

module.exports = { AppModule };
