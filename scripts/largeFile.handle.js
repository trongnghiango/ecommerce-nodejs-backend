const fs = require('fs');
const path = require('path');

async function processChunk(chunkPath) {
  // Hàm xử lý từng phần
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(chunkPath);
    let data = '';

    stream.on('data', (chunk) => {
      data += chunk; // Xử lý dữ liệu
    });

    stream.on('end', () => {
      console.log(`Processed ${chunkPath}`);
      resolve(data); // Trả về dữ liệu đã xử lý
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
    const chunkPath = path.join(__dirname, `chunk-${i}.txt`);

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
const filePath = './largefile.txt';
const chunkSize = 1024 * 1024; // Kích thước mỗi phần (1MB)
splitAndProcessFile(filePath, chunkSize);
