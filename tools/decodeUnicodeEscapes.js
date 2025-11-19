const fs = require('fs');
const path = require('path');

function decodeUnicodeEscapes(input) {
  return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function processFile(filePath) {
  const absolutePath = path.resolve(filePath);
  console.log('Processing', absolutePath);
  let content = fs.readFileSync(absolutePath, 'utf8');

  const decoded = decodeUnicodeEscapes(content);
  if (decoded === content) {
    console.log('No changes necessary.');
    return;
  }

  // create a backup
  const backupPath = absolutePath + '.bak_unicode';
  fs.writeFileSync(backupPath, content, 'utf8');
  console.log('Backup written to', backupPath);

  fs.writeFileSync(absolutePath, decoded, 'utf8');
  console.log('File updated');
}

const target = process.argv[2] || 'src/screens/Screen/LanguageContext.js';
processFile(target);
