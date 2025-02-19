const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation vvv',
      version: '1.0.0',
      description: 'API documentation for my Express project',
    },
    servers: [
      {
        url: 'http://localhost:3051/v1/api',
      },
    ],
  },
  apis: ['./src/v1/routes/**/*.js'], // Đường dẫn tới các tệp chứa tài liệu API
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

module.exports = setupSwagger;
