const path = require('path')
let path1 = path.join(__dirname, '/test')
console.log(__dirname, path1)
let path2 = path.resolve(__dirname, '/test')
console.log(__dirname, path2)