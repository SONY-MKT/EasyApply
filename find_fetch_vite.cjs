const fs = require('fs');
const content = fs.readFileSync('node_modules/vite/dist/client/client.mjs', 'utf8');
const regex = /.{0,50}\.?fetch\s*=[^=].{0,50}/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(match[0]);
}
