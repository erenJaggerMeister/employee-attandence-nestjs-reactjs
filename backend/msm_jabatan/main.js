const { bootstrapMicroservice } = require('../common/runner');
const { AppModule } = require('./src/app.module');

const PORT = process.env.PORT_MSM_JABATAN || 6005;
bootstrapMicroservice(AppModule, PORT, 'msm_jabatan');
