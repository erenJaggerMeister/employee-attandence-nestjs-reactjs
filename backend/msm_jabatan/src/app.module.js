const { Module } = require('@nestjs/common');
const { JabatanController } = require('./controller/jabatan.controller');
const { JabatanService } = require('./service/jabatan.service');

@Module({
  controllers: [JabatanController],
  providers: [JabatanService],
})
class AppModule {}

module.exports = { AppModule };
