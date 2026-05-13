const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/"\/admin\/login"/g, '"/login"')
    .replace(/"\/admin\/users/g, '"/users')
    .replace(/"\/admin\/deliveries/g, '"/deliveries')
    .replace(/"\/admin\/goals/g, '"/goals')
    .replace(/"\/admin\/market/g, '"/market')
    .replace(/"\/admin\/finances/g, '"/finances')
    .replace(/"\/admin\/settings/g, '"/settings')
    .replace(/"\/admin"/g, '"/"');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed:', filePath);
  }
}

walk('apps/admin/app', processFile);
walk('apps/admin/components', processFile);
walk('apps/admin/lib', processFile);

console.log('Done fixing admin routes.');
