const { compiler } = require( './Translator/index')

let code = '(add 2 (subtract 4 2))'
console.log(compiler(code));