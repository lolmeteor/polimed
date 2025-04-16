const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Скрипт для настройки SSH-туннеля к МИС серверу
 */

// Путь к временному файлу с SSH ключом
const KEY_FILE_PATH = path.join(os.tmpdir(), 'mis_ssh_key');

// SSH параметры
const SSH_HOST = '51.250.34.77';
const SSH_USER = 'ubuntu';
const REMOTE_HOST = 'gw.chel.mnogomed.ru';
const REMOTE_PORT = 9095;
const LOCAL_PORT = 9095;

// Содержимое SSH ключа из файла cursorinfo/id_rsa
const SSH_KEY = `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAQEAvKREDztIiIambId5fWIkovuGyEehBrTvDs/QYNqpjwvZMNoo5jKA
eS6XGl9NkkjQLZVR6y+1XeTsmXhgaZUElmBpb5giDEx2lXR2/fWjeQDdx477/2q3OAJEWH
9yEbtXm0sOxDpLmY+24ylD95nHsrfrlkmxXcPYPVdHsghZ3O3mQoQ0B48ONlifcO6zR1R6
6KDzNZ5pFKi3y/J5YOxnVaRf5PYzkWpzvcxxywrBp32Xk/GlF2eLMQgSMaRJH23jL6WJxY
N83TqEMyF+uaFpdXBHbnX2zIV2/jx10+ZGEmRRMhkNxuOPagY5XQuFP/+7d+d+02KAld7A
eMKyQs2OYwAAA9BRchnbUXIZ2wAAAAdzc2gtcnNhAAABAQC8pEQPO0iIhqZsh3l9YiSi+4
bIR6EGtO8Oz9Bg2qmPC9kw2ijmMoB5LpcaX02SSNAtlVHrL7Vd5OyZeGBplQSWYGlvmCIM
THaVdHb99aN5AN3Hjvv/arc4AkRYf3IRu1ebSw7EOkuZj7bjKUP3mceyt+uWSbFdw9g9V0
eyCFnc7eZChDQHjw42WJ9w7rNHVHrooPM1nmkUqLfL8nlg7GdVpF/k9jORanO9zHHLCsGn
fZeT8aUXZ4sxCBIxpEkfbeMvpYnFg3zdOoQzIX65oWl1cEdudfbMhXb+PHXT5kYSZFEyGQ
3G449qBjldC4U//7t3537TYoCV3sB4wrJCzY5jAAAAAwEAAQAAAQBV9130uwWBAivRhaN9
2j3r8Egp+UqOreHLlDTYDo363GFr+99rmFQn5W2C3S+SnJASVdvxG9rBIVQZVFxLgVeH2A
P0kRXjGO1pipu3fDu1JwnqqWR5r34zjgTrd5jaL8/quzfNgOt23aFwwBtzOKdi8KHx6T9l
BZ0Dx0SrA1dAcHl/fnNa/gftqCsPzPdYnyWl7X3xqxWoASY5LGWIHto5HRAtoZ5AGruBlu
91/Tobk/+/pD7j2uA9YuDwRFKmLEg0alWfATECHDkOgrvUzGZFN1A7jdz0oW/d++xTxhWc
+ivU187QNJMHF6WNZMyLPljZl/8riPbPBK//njoHVXChAAAAgHnds1kl9rj8t68nLWMPx1
SDCGsr+hCYHrGX8FlD3IoB4QEfwXWBHarmW3pirLBd9B6QuKyLoPs4IkRYC1TrYqCaTf75
wtA42jiKXyc0qd6WvAUcTj5Y74lFtZa/ti0Cc6w4YMT9El1R5gjFmjLR4BVLp72wsdg4Ga
8QTPIQvgS/AAAAgQDiS6Mn/GPs2l565AWuq99Dr/vzED0M8lD6Mb4CHRGJY3hwb8Nf4/Lx
lHtMtMWmFqVD/VBi7O4OSThdmeF9ZnubQmuY19hREGQNmFkonZ4NJykafK5MgcrW+k/+Lz
sCjEymiAhuS38r2jnfLJ6GsG+jawuZET/Gve0c7Nvy+j+K6wAAAIEA1WdScTpRUUthsuzg
ul0I/PWWaat7qdXKkGj22NcGwC+EKRrFCuX6y3IsBVAJagGhJfBkWA6VouSHA+wCVoKGmd
2JIBy8rJpxdmSCRN4J0H0iUoPW6xbQ32p+ViXfwvmFDP0/PQc8G98dPufFCudPvMe2iSv1
sA4NYpIsgY3rvGkAAAAUdmFzeWFAVmFza29zdF9odWF3ZWkBAgMEBQYH
-----END OPENSSH PRIVATE KEY-----`;

/**
 * Записывает SSH ключ во временный файл
 */
async function writeKeyFile() {
  console.log('Создание временного файла с SSH ключом...');
  try {
    await fs.promises.writeFile(KEY_FILE_PATH, SSH_KEY, { mode: 0o600 });
    console.log(`SSH ключ сохранен в ${KEY_FILE_PATH}`);
    return true;
  } catch (error) {
    console.error('Ошибка при сохранении SSH ключа:', error);
    return false;
  }
}

/**
 * Устанавливает SSH туннель
 */
async function setupTunnel() {
  const keySuccess = await writeKeyFile();
  if (!keySuccess) return;

  console.log(`Настройка SSH туннеля: localhost:${LOCAL_PORT} -> ${REMOTE_HOST}:${REMOTE_PORT}`);
  
  // Формируем команду для SSH туннеля
  const sshArgs = [
    '-i', KEY_FILE_PATH,
    '-L', `${LOCAL_PORT}:${REMOTE_HOST}:${REMOTE_PORT}`,
    '-o', 'StrictHostKeyChecking=no',
    `${SSH_USER}@${SSH_HOST}`
  ];

  // Запускаем SSH процесс
  const sshProcess = spawn('ssh', sshArgs, {
    stdio: 'inherit'
  });

  // Обработка событий процесса
  sshProcess.on('error', (error) => {
    console.error('Ошибка запуска SSH:', error);
  });

  sshProcess.on('close', (code) => {
    console.log(`SSH туннель закрыт с кодом ${code}`);
    // Удаляем временный файл с ключом
    try {
      fs.unlinkSync(KEY_FILE_PATH);
      console.log('Временный файл с ключом удален');
    } catch (error) {
      console.error('Ошибка при удалении файла с ключом:', error);
    }
  });

  // Обработка завершения процесса
  process.on('SIGINT', () => {
    console.log('Получен сигнал прерывания, закрытие туннеля...');
    sshProcess.kill();
  });

  console.log('SSH туннель запущен. Нажмите Ctrl+C для завершения.');
  console.log(`МИС API будет доступен по адресу: http://localhost:${LOCAL_PORT}/HubService.svc`);
}

// Запуск настройки туннеля
setupTunnel().catch(error => {
  console.error('Ошибка при настройке туннеля:', error);
}); 