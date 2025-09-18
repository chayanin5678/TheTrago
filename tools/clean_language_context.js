const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filePath = path.resolve(__dirname, '..', 'src', 'screens', 'Screen', 'LanguageContext.js');
const content = fs.readFileSync(filePath, 'utf8');

const marker = 'const translations';
const idx = content.indexOf(marker);
if (idx === -1) {
  console.error('translations marker not found');
  process.exit(1);
}

// find the start of the object
const objStart = content.indexOf('{', idx);
if (objStart === -1) {
  console.error('start brace not found');
  process.exit(1);
}

// find matching closing brace for the translations object
let i = objStart;
let depth = 0;
let endIndex = -1;
for (; i < content.length; i++) {
  const ch = content[i];
  if (ch === '{') depth++;
  else if (ch === '}') {
    depth--;
    if (depth === 0) {
      endIndex = i;
      break;
    }
  }
}

if (endIndex === -1) {
  console.error('could not find end of translations object');
  process.exit(1);
}

const objText = content.slice(idx, endIndex + 1); // includes 'const translations = { ... }'

// Create code to evaluate and export the translations object
const code = objText + '\n;module.exports = translations;';

let translations;
try {
  const context = { module: {}, exports: {} };
  vm.runInNewContext(code, context, { timeout: 1000 });
  translations = context.module.exports;
} catch (e) {
  console.error('evaluation failed', e && e.message);
  process.exit(1);
}

// Now stringify to clean duplicates and produce a stable output
function escapeUnicode(str) {
  return str.replace(/[^\0-\x7F]/g, function (c) {
    return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
  });
}

const json = JSON.stringify(translations, null, 2);
// Escape non-ASCII so file encoding is safe
const escaped = escapeUnicode(json);
const cleaned = 'const translations = ' + escaped + ';\n';

// Replace the translations block in the original file and write back
const backupPath = filePath + '.bak';
fs.copyFileSync(filePath, backupPath);

const newContent = content.slice(0, idx) + cleaned + content.slice(endIndex + 1);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Rewrote translations block and backed up original to', backupPath);
