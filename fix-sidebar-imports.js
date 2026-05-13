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
  if (!filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(
    /import \{ SidebarTrigger \} from "@chowvest\/ui";/g,
    'import { SidebarTrigger } from "@/components/ui/sidebar";'
  );

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed:', filePath);
  }
}

walk('apps/admin/app/(protected)', processFile);
console.log('Done fixing sidebar trigger imports.');
