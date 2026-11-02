const { bootstrapMicroservice } = require('../common/runner');
const { AppModule } = require('./src/app.module');

const PORT = process.env.PORT_MSM_USER || 6001;
bootstrapMicroservice(AppModule, PORT, 'msm_user');
