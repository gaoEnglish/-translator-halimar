/**
 * ============================================================================
 *                                  (۶* ‘ヮ’)۶”
 *                         !!!!!!!!编译器!!!!!!!!
 * ============================================================================
 */

const { tokenizer } = require('./tokenizer');
const { parser } = require('./parser');
const { transformer } = require('./transformer');
const { codeGenerator } = require('./codeGenerator');
/**
 * 最后，我们创建一个compiler方法，这里我们把编译器的所有部分连接起来
 *
 *   1. input  => tokenizer   => tokens
 *   2. tokens => parser      => ast
 *   3. ast    => transformer => newAst
 *   4. newAst => generator   => output
 */

module.exports={ compiler }

function compiler(input) {
    let tokens = tokenizer(input);
    let ast    = parser(tokens);
    let newAst = transformer(ast);
    let output = codeGenerator(newAst);
  
    // 输出返回值
    return output;
}