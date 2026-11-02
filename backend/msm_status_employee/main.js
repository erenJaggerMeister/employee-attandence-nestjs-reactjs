const { bootstrapMicroservice } = require('../common/runner');
const { AppModule } = require('./src/app.module');

const PORT = process.env.PORT_MSM_STATUS_EMPLOYEE || 6007;
bootstrapMicroservice(AppModule, PORT, 'msm_status_employee');
