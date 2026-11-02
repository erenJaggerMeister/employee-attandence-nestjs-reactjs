const { bootstrapMicroservice } = require('../common/runner');
const { AppModule } = require('./src/app.module');

const PORT = process.env.PORT_MSF_ATTENDANCE || 5002;
bootstrapMicroservice(AppModule, PORT, 'msf_attendance');
