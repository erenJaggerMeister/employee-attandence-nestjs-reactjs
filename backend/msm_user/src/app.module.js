const { Module } = require('@nestjs/common');
const { UserController } = require('./controller/user.controller');
const { UserService } = require('./service/user.service');

@Module({
  controllers: [UserController],
  providers: [UserService],
})
class AppModule {}

module.exports = { AppModule };
