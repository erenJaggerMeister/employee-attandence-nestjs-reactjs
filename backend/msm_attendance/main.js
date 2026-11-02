const { bootstrapMicroservice } = require('../common/runner');
const { AppModule } = require('./src/app.module');

const PORT = process.env.PORT_MSM_ATTENDANCE || 6003;
bootstrapMicroservice(AppModule, PORT, 'msm_attendance');
