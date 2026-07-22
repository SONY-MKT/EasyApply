const fs = require('fs');
const path = require('path');
function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== '.bin' && !fullPath.includes('esbuild')) {
        search(fullPath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("defineProperty") && content.includes("fetch")) {
        console.log("Found in", fullPath);
      }
    }
  }
}
search('node_modules');
