import fs from 'fs';
import fetch from 'node-fetch';

let totalChunks = 20; // Số phần của file
const fileChunks = [];

// Hàm gọi API để lấy kích thước file và chunk size
async function getFileSizeAndChunkSize(filename = 'largefile.txt') {
  const response = await fetch(`http://localhost:3000/file-size/${filename}`);
  if (!response.ok) {
    throw new Error(`Không thể lấy kích thước file: ${response.statusText}`);
  }
  //
  const data = await response.json();
  return { totalChunks: data.totalChunks, chunkSize: data.chunkSize };
}

// Hàm tải xuống từng phần
async function downloadChunk(chunkId, filename = 'largefile.txt') {
  console.info({ chunkId });
  const response = await fetch(`http://localhost:3000/downloads/${filename}/${chunkId}`);
  if (!response.ok) {
    throw new Error(`Không thể tải xuống chunk ${chunkId}: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer); // Chuyển đổi ArrayBuffer thành Buffer
  fileChunks[chunkId] = buffer;
}

// Hàm hợp nhất các phần
function mergeChunks() {
  const fullFile = Buffer.concat(fileChunks);
  fs.writeFileSync('merged_largefile.txt', fullFile);
  console.log('Đã hợp nhất tất cả các phần thành merged_largefile.txt');
}

// Hàm tải xuống tất cả các phần
async function downloadAllChunks(filename = 'largefile.txt') {
  const downloadPromises = [];
  for (let i = 0; i < totalChunks; i += 1) {
    downloadPromises.push(downloadChunk(i, filename));
  }
  await Promise.all(downloadPromises);
  mergeChunks();
}

// Gọi hàm để lấy kích thước file và tải xuống tất cả các phần
async function main() {
  const { totalChunks: chunks, chunkSize } = await getFileSizeAndChunkSize();
  totalChunks = chunks; // Cập nhật số lượng phần
  console.log(`Tổng số phần: ${totalChunks}, Kích thước mỗi phần: ${chunkSize}`);
  await downloadAllChunks();
}

main().catch((err) => console.error(err));
