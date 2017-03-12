const fs = require('fs');
const path = process.argv[2];

fs.unlinkSync(path);
fs.closeSync(fs.openSync(`./archive/${path.split('/').pop()}`, 'w'));
