const { bootstrapMicroservice } = require('../common/runner');
const { AppModule } = require('./src/app.module');

const PORT = process.env.PORT_MSF_AUTH || 5000;
bootstrapMicroservice(AppModule, PORT, 'msf_auth');
