const fs = require('fs');

const path = process.argv[2];
const pathArr = path.split('/');
const newFilePath = `${pathArr[0]}/${pathArr[1]}/archive/${pathArr[2]}`;

fs.unlinkSync(path);
fs.closeSync(fs.openSync(newFilePath, 'w'));
