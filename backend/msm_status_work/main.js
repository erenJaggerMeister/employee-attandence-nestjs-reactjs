const { bootstrapMicroservice } = require('../common/runner');
const { AppModule } = require('./src/app.module');

const PORT = process.env.PORT_MSM_STATUS_WORK || 6006;
bootstrapMicroservice(AppModule, PORT, 'msm_status_work');
