const fs = require('fs');
const path = require('path');

async function processChunk(chunkPath) {
  // Hàm xử lý từng phần file nhị phân
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(chunkPath);
    let data = Buffer.alloc(0); // Khởi tạo buffer rỗng

    stream.on('data', (chunk) => {
      data = Buffer.concat([data, chunk]); // Kết hợp dữ liệu nhị phân
    });

    stream.on('end', () => {
      console.log(`Processed ${chunkPath}`);
      resolve(data); // Trả về buffer đã xử lý
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

async function splitAndProcessFile(filePath, chunkSize) {
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;
  const chunkCount = Math.ceil(fileSize / chunkSize);
  const promises = [];

  for (let i = 0; i < chunkCount; i += 1) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize - 1, fileSize - 1);
    const chunkPath = path.join(__dirname, `chunk-${i}.bin`);

    // Tạo file chunk
    const readStream = fs.createReadStream(filePath, { start, end });
    const writeStream = fs.createWriteStream(chunkPath);
    readStream.pipe(writeStream);

    // Đợi cho đến khi ghi chunk hoàn tất
    await new Promise((resolve) => writeStream.on('finish', resolve));

    // Thêm promise xử lý chunk vào mảng
    promises.push(processChunk(chunkPath));
  }

  // Chờ tất cả các phần hoàn thành
  const results = await Promise.all(promises);
  console.log('All chunks processed:', results);
}

// Sử dụng hàm
const filePath = 'path/to/large/binary/file.bin'; // Đường dẫn đến file nhị phân
const chunkSize = 1024 * 1024; // Kích thước mỗi phần (1MB)
splitAndProcessFile(filePath, chunkSize);
