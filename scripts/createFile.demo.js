const fs = require('fs');

const filePath = 'largefile.txt'; // Tên file
const fileSizeInMB = 20; // Dung lượng file mong muốn
const data = 'This is a line of text. ';

// Tính toán số lượng lần lặp cần thiết để tạo ra file 20MB
const totalBytes = fileSizeInMB * 1024 * 1024; // Chuyển đổi MB sang byte
const iterations = Math.ceil(totalBytes / Buffer.byteLength(data)); // Số lần lặp

const writeStream = fs.createWriteStream(filePath);

for (let i = 0; i < iterations; i += 1) {
  writeStream.write(data);
}

writeStream.end(() => {
  console.log(`File ${filePath} đã được tạo với dung lượng ${fileSizeInMB}MB.`);
});
