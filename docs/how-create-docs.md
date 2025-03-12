# How create document
Để tạo tài liệu Swagger cho một dự án Express, bạn có thể sử dụng thư viện `swagger-jsdoc` kết hợp với `swagger-ui-express`. Dưới đây là hướng dẫn từng bước để thiết lập Swagger cho dự án của bạn.

### Bước 1: Cài Đặt Các Gói Cần Thiết

Trước tiên, bạn cần cài đặt các gói sau:

```bash
yarn add swagger-jsdoc swagger-ui-express
```

### Bước 2: Thiết Lập Swagger trong Dự Án Express

1. **Tạo Tệp `swagger.js`**: Tạo một tệp mới có tên `swagger.js` trong thư mục gốc của dự án.

```javascript
// swagger.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for my Express project',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], // Đường dẫn tới các tệp chứa tài liệu API
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

module.exports = setupSwagger;
```

2. **Cập Nhật Tệp Chính của Ứng Dụng**: Trong tệp chính của ứng dụng (thường là `app.js` hoặc `server.js`), bạn cần nhập và thiết lập Swagger.

```javascript
const express = require('express');
const setupSwagger = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// Thiết lập Swagger
setupSwagger(app);

// Các route của bạn
app.get('/api/example', (req, res) => {
  res.send('This is an example endpoint');
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

### Bước 3: Tài Liệu API

Trong các tệp định nghĩa route (ví dụ: trong thư mục `routes`), bạn có thể thêm các chú thích Swagger để mô tả các endpoint. Ví dụ:

```javascript
/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Get an example
 *     responses:
 *       200:
 *         description: A successful response
 */
```

### Bước 4: Chạy Ứng Dụng

Chạy ứng dụng Express của bạn:

```bash
node app.js
```

### Bước 5: Truy Cập Tài Liệu Swagger

Mở trình duyệt và truy cập URL sau để xem tài liệu Swagger:

```
http://localhost:3000/api-docs
```

### Kết Luận

Bây giờ bạn đã thiết lập thành công tài liệu Swagger cho dự án Express của mình. Bạn có thể thêm nhiều endpoint và tài liệu khác theo nhu cầu của dự án. Nếu bạn có câu hỏi hoặc cần thêm thông tin, hãy cho tôi biết!