const { bootstrapMicroservice } = require('../common/runner');
const { AppModule } = require('./src/app.module');

const PORT = process.env.PORT_MSF_EMPLOYEE || 5001;
bootstrapMicroservice(AppModule, PORT, 'msf_employee');
