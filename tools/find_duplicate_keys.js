const fs = require('fs');
const path = require('path');

function extractObject(text, startIndex) {
  let i = startIndex;
  let brace = 0;
  let inString = false;
  let stringChar = '';
  for (; i < text.length; i++) {
    const ch = text[i];
    if (!inString && (ch === '"' || ch === "'")) { inString = true; stringChar = ch; continue; }
    if (inString) {
      if (ch === stringChar && text[i-1] !== '\\') inString = false;
      continue;
    }
    if (ch === '{') brace++;
    else if (ch === '}') {
      brace--;
      if (brace === 0) return text.slice(startIndex, i + 1);
    }
  }
  return null;
}

function findTranslations(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const results = {};
  const patterns = ['th\\s*:\\s*{', 'en\\s*:\\s*{'];
  patterns.forEach(pat => {
    const re = new RegExp(pat);
    const m = re.exec(src);
    if (m) {
      const start = m.index + m[0].length - 1; // position at '{'
      const objText = extractObject(src, start);
      if (objText) {
        // extract keys at top level (approx): match lines like key: or 'key': or "key":
        const keyRe = /(?:^|\s|\n)([a-zA-Z0-9_\-]+)\s*:/g;
        const strKeyRe = /(?:^|\s|\n)['\"]([^"'\\]+)['\"]\s*:/g;
        const keys = [];
        let km;
        while ((km = keyRe.exec(objText)) !== null) keys.push(km[1]);
        while ((km = strKeyRe.exec(objText)) !== null) keys.push(km[1]);
        const dupes = keys.reduce((acc, k) => { acc[k] = (acc[k]||0)+1; return acc; }, {});
        const d = Object.entries(dupes).filter(([k,v]) => v>1).map(([k,v]) => ({key:k,count:v}));
        results[pat.replace('\\s\*:\\s\*{','')] = {totalKeys: keys.length, duplicates: d};
      } else {
        results[pat] = {error: 'object parse failed'};
      }
    } else {
      results[pat] = {error: 'not-found'};
    }
  });
  return results;
}

const target = process.argv[2] || path.join(__dirname, '..', 'src', 'screens', 'Screen', 'LanguageContext.js');
if (!fs.existsSync(target)) {
  console.error('File not found:', target); process.exit(2);
}
const res = findTranslations(target);
console.log('Duplicate key scan for:', target);
console.log(JSON.stringify(res, null, 2));

// Also print a short list of duplicate keys with counts for convenience
const out = JSON.parse(JSON.stringify(res));
Object.keys(out).forEach(k => {
  if (out[k].duplicates && out[k].duplicates.length) {
    console.log('\nIn', k, 'found duplicates:');
    out[k].duplicates.forEach(d => console.log(`  ${d.key}: ${d.count}`));
  } else {
    console.log('\nIn', k, 'no duplicates found.');
  }
});
