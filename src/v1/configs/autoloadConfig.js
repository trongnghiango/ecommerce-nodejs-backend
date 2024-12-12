const logger = require('@/v1/utils/logger.util');
const fs = require('fs');
const path = require('path');

// Đường dẫn tới file cấu hình JSON
const configFilePath = path.join(process.cwd(), 'config', 'role.json');

// Hàm để tải lại cấu hình
const loadConfig = () => {
  try {
    const jsonData = fs.readFileSync(configFilePath, 'utf-8');
    return JSON.parse(jsonData); // Trả về đối tượng JSON
  } catch (error) {
    logger.error(`Không thể tải lại cấu hình:: ${error}`);
    return null; // Trả về null nếu có lỗi
  }
};

// Biến để lưu trữ cấu hình
let config = loadConfig();

// Hàm để lấy cấu hình
const getConfig = () => config;

// Hàm để tự động tải lại cấu hình
const watchConfig = () => {
  fs.watchFile(configFilePath, (_curr, _prev) => {
    logger.info(`File ${configFilePath} đã thay đổi. Tải lại cấu hình...`);
    config = loadConfig(); // Tải lại cấu hình
  });
};

// Xuất các hàm và biến
module.exports = {
  getConfig,
  watchConfig,
};
