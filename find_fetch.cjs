const fs = require('fs');
const files = fs.readdirSync('dist/assets').filter(f => f.endsWith('.js'));
for (const file of files) {
  const content = fs.readFileSync('dist/assets/' + file, 'utf8');
  const regex = /.{0,50}\.?fetch\s*=[^=].{0,50}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    console.log(match[0]);
  }
}
