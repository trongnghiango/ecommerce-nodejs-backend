const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const directoryPath = path.join(__dirname, 'files'); // Thư mục chứa file
let filePath = path.join(__dirname, 'Maxillary.stl'); // Đường dẫn đến file gốc
// const filePath = path.join(__dirname, 'largefile.txt'); // Đường dẫn đến file gốc
let chunkSize = 1024 * 1024; // Kích thước mỗi phần (1MB)

// Hàm tạo file 20MB
function createLargeFile() {
  const fileSizeInMB = 100;
  const data = 'This is a line of text. ';
  const totalBytes = fileSizeInMB * 1024 * 1024;
  const iterations = Math.ceil(totalBytes / Buffer.byteLength(data));
  const writeStream = fs.createWriteStream(filePath);

  for (let i = 0; i < iterations; i += 1) {
    writeStream.write(data);
  }

  writeStream.end(() => {
    console.log(`File ${filePath} đã được tạo với dung lượng ${fileSizeInMB}MB.`);
  });
}

// // Tạo file nếu chưa tồn tại
// if (!fs.existsSync(filePath)) {
//   createLargeFile();
// }

// Endpoint để tải xuống từng phần
app.get('/download/chunk/:chunkId', (req, res) => {
  const chunkId = parseInt(req.params.chunkId, 10);
  const start = chunkId * chunkSize;
  const end = Math.min(start + chunkSize - 1, fs.statSync(filePath).size - 1);

  const readStream = fs.createReadStream(filePath, { start, end });
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="chunk-${chunkId}.txt"`,
    'Content-Range': `bytes ${start}-${end}/${fs.statSync(filePath).size}`,
  });

  readStream.pipe(res);
});

app.get('/file-size/:filename', (req, res) => {
  const { filename } = req.params;
  filePath = path.join(directoryPath, filename);
  const fileStats = fs.statSync(filePath);
  chunkSize = 1024 * 1024; // Kích thước mỗi phần (1MB)
  const totalChunks = Math.ceil(fileStats.size / chunkSize);
  res.json({ size: fileStats.size, chunkSize, totalChunks });
});

// Endpoint để tải xuống từng phần của file
app.get('/downloads/:filename/:chunkId', async (req, res) => {
  const { filename, chunkId: id } = req.params;
  const chunkId = parseInt(id, 10);
  chunkSize = parseInt(req.query.chunkSize, 10) || 1024 * 1024; // Mặc định là 1MB
  filePath = path.join(directoryPath, filename);
  try {
    // Kiểm tra xem file có tồn tại và lấy thông tin file
    const stats = await fs.promises.stat(filePath);

    const start = chunkId * chunkSize;
    const end = Math.min(start + chunkSize - 1, stats.size - 1);

    console.log('ddll', { filename, chunkId, chunkSize, filePath, start, end });
    if (start >= stats.size) {
      return res.status(416).send('Chunk ID ngoài giới hạn.');
    }

    // Gửi phần file cho client
    const readStream = fs.createReadStream(filePath, { start, end });

    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
      'Accept-Ranges': 'bytes',
    });

    readStream.pipe(res);

    readStream.on('error', (streamErr) => {
      res.status(500).send('Có lỗi xảy ra khi tải xuống phần file.');
    });
  } catch (err) {
    console.log(err.message);
    res.status(404).send('File không tồn tại.');
  }
});

// Bắt đầu server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
