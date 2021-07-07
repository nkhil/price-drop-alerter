const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');

const database = require('./lib/db');

const app = express();

app.use(express.json({ limit: '1kb' }));

const apiSpec = path.join(__dirname, '../swagger/swagger.yml');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use('/swagger', express.static(apiSpec));
app.use(express.urlencoded({ extended: false }));

async function init() {
  await database.connect();
  
  app.use(
    OpenApiValidator.middleware({
      apiSpec,
      validateResponses: true,
      operationHandlers: path.join(__dirname, './controllers'),
      validateSecurity: {
        handlers: {},
      },
    }),
  );

  app.use((err, req, res) => {
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
    });
  });

  return app;
}

module.exports = init;
