const { Module } = require('@nestjs/common');
const { RoleController } = require('./controller/role.controller');
const { RoleService } = require('./service/role.service');

@Module({
  controllers: [RoleController],
  providers: [RoleService],
})
class AppModule {}

module.exports = { AppModule };
