const { Module } = require('@nestjs/common');
const { StatusWorkController } = require('./controller/status-work.controller');
const { StatusWorkService } = require('./service/status-work.service');

@Module({
  controllers: [StatusWorkController],
  providers: [StatusWorkService],
})
class AppModule {}

module.exports = { AppModule };
