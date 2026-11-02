const { bootstrapMicroservice } = require('../common/runner');
const { AppModule } = require('./src/app.module');

const PORT = process.env.PORT_MSM_ROLE || 6004;
bootstrapMicroservice(AppModule, PORT, 'msm_role');
