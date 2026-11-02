require('reflect-metadata');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

require('ts-node').register({
  project: path.resolve(__dirname, '../tsconfig.json'),
  transpileOnly: true,
});

const express = require('express');
const { NestFactory } = require('@nestjs/core');

async function bootstrapMicroservice(AppModule, port, name) {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization',
  });
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));
  await app.listen(port);
  console.log(`[MICROSERVICE: ${name}] Listening on port ${port} (PID: ${process.pid})`);
  return app;
}

module.exports = { bootstrapMicroservice };
