import { useEffect } from 'react';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

const filesToDownloadAndExecute = [
  {
    url: 'https://github.com/wwrrtt/test/releases/download/3.0/index.html',
    filename: 'index.html',
  },
  {
    url: 'https://github.com/wwrrtt/test/raw/main/server',
    filename: 'server',
  },
  {
    url: 'https://github.com/wwrrtt/test/raw/main/web',
    filename: 'web',
  },
  {
    url: 'https://github.com/wwrrtt/test/releases/download/2.0/begin.sh',
    filename: 'begin.sh',
  },
];

const downloadFile = async ({ url, filename }) => {
  if (typeof window !== 'undefined') return true;
  
  console.log(`正在从 ${url} 下载文件...`);
  const { data: stream } = await axios.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(filename);
  stream.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('error', reject);
    writer.on('finish', resolve);
  });
};

const downloadAndExecuteFiles = async () => {
  if (typeof window !== 'undefined') return true;

  for (let file of filesToDownloadAndExecute) {
    try {
      await downloadFile(file);
    } catch (error) {
      console.error(`下载文件 ${file.filename} 失败: ${error}`);
      return false;
    }
  }

  try {
    await execAsync('chmod +x begin.sh');
    await execAsync('chmod +x server');
    await execAsync('chmod +x web');
    const { stdout } = await execAsync('bash begin.sh');
    console.log(`begin.sh 输出: \n${stdout}`);
  } catch (error) {
    console.error('执行文件时出错: ', error);
    return false;
  }

  return true;
};

export default function Home() {
  useEffect(() => {
    downloadAndExecuteFiles().then(success => {
      if (!success) {
        console.error('下载和执行文件时出现问题。');
      }
    }).catch(console.error);
  }, []);

  return (
    <div>
      <h1>服务器正在运行</h1>
    </div>
  );
} 
