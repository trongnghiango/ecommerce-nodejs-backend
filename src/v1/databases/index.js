// /src/v1/databases/index.js
const { db } = require('./drizzle');
// Có thể export thêm các table từ đây nếu muốn một điểm truy cập duy nhất
module.exports = {
  db,
  // shopsTable, usersTable, ... (nếu bạn đã export từ drizzle.js)
};
