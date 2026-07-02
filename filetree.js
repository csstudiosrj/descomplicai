const fs = require('fs');
const path = require('path');

const IGNORE = ['node_modules', '.next', '.git', 'package-lock.json'];

function walk(dir, prefix = '', result = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  const dirs = items.filter(i => i.isDirectory() && !IGNORE.includes(i.name)).sort((a, b) => a.name.localeCompare(b.name));
  const files = items.filter(i => i.isFile() && !IGNORE.includes(i.name)).sort((a, b) => a.name.localeCompare(b.name));
  
  dirs.forEach((d, i) => {
    const isLast = i === dirs.length - 1 && files.length === 0;
    result.push(prefix + (isLast ? '└── ' : '├── ') + d.name + '/');
    walk(path.join(dir, d.name), prefix + (isLast ? '    ' : '│   '), result);
  });
  
  files.forEach((f, i) => {
    const isLast = i === files.length - 1;
    result.push(prefix + (isLast ? '└── ' : '├── ') + f.name);
  });
  
  return result;
}

const tree = walk('.');
const output = '.\n' + tree.join('\n') + '\n';
fs.writeFileSync('filetree.txt', output);
console.log('filetree.txt criado');