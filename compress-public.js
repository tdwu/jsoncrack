const fs = require('fs-extra');
const path = require('path');
const zlib = require('zlib');

const publicDir = path.join(__dirname, 'out/console');  // 设置 public 目录

// 定义要压缩的文件类型
const fileTypes = ['.js', '.css', '.html', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico'];

// 压缩文件的函数
const compressFile = (filePath, threshold, minRatio) => {
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;  // 获取文件大小

  if (fileSize > threshold) {  // 判断文件大小是否大于 threshold
    const gzip = zlib.createGzip();
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(`${filePath}.gz`);

    // 计算原始文件大小和压缩后文件的大小
    let originalSize = fileSize;
    let compressedSize = 0;

    input
      .pipe(gzip)
      .pipe(output)
      .on('finish', () => {
        compressedSize = fs.statSync(`${filePath}.gz`).size;  // 获取压缩后文件的大小

        const ratio = compressedSize / originalSize;  // 计算压缩比
        if (ratio < minRatio) {
          console.log(`Compressed: ${filePath} (Original size: ${originalSize} bytes, Compressed size: ${compressedSize} bytes, Ratio: ${ratio.toFixed(2)})`);
        } else {
          fs.unlinkSync(`${filePath}.gz`);  // 删除未满足压缩比条件的文件
          console.log(`Removed: ${filePath}.gz (Compression ratio ${ratio.toFixed(2)} is greater than minRatio ${minRatio})`);
        }
      });
  } else {
    console.log(`Skipped: ${filePath} (Size: ${fileSize} bytes is less than threshold ${threshold})`);
  }
};

// 遍历目录的函数
const traverseDir = (dir, threshold, minRatio) => {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 如果是目录，递归调用
      traverseDir(filePath, threshold, minRatio);
    } else if (stat.isFile()) {
      // 如果是文件，检查文件类型
      const ext = path.extname(file);
      if (fileTypes.includes(ext)) {
        compressFile(filePath, threshold, minRatio);  // 调用压缩文件的函数
      }
    }
  });
};

// 设置 threshold 和 minRatio
const threshold = 8192;  // 压缩大于 8KB 的文件
const minRatio = 0.8;     // 压缩比小于 0.8 时保留压缩文件

// 开始遍历 public 目录
traverseDir(publicDir, threshold, minRatio);
