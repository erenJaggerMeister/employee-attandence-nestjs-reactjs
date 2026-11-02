const { bootstrapMicroservice } = require('../common/runner');
const { AppModule } = require('./src/app.module');

const PORT = process.env.PORT_MSM_EMPLOYEE || 6002;
bootstrapMicroservice(AppModule, PORT, 'msm_employee');
