
/**
 * ============================================================================
 *                               ヾ（〃＾∇＾）ﾉ
 *                            代码生成!!!!
 * ============================================================================
 */

/**
 * 最后的阶段到来：代码生成
 *
 *代码生成器将递归的调用自身，打印所有节点，将树变成一个长字符串
 */
module.exports={ codeGenerator }

function codeGenerator(node){
    // 我们根据节点类型进行处理
    switch (node.type){
        // 如果是`Program` 节点. 我们将匹配body里面的所有节点
        //并且通过代码生成器用换行符将他们分开
        case 'Program':
            return node.body.map(codeGenerator)
            .join('\n');
        
        // 如果是`ExpressionStatement`类型，我们将对嵌套操作调用代码生成器并加分号
        case 'ExpressionStatement':
            return (
              codeGenerator(node.expression) +
              ';' // << (...因为我们喜欢以*正确*的方式编码)
            );

        //如果是 `CallExpression`，我们将用开括号和闭括号把参数包起来，并且参数之间用逗号隔开
        case 'CallExpression':
            return (
              codeGenerator(node.callee) +
              '(' +
              node.arguments.map(codeGenerator)
                .join(', ') +
              ')'
            );
        // 如果是`Identifier`类型我们之间返回节点名称
        case 'Identifier':
            return node.name;
        
        // 如果是`NumberLiteral` 类型直接返回节点值
        case 'NumberLiteral':
            return node.value;

        // 如果是`StringLiteral` 类型，则用双引号将节点值包起来
        case 'StringLiteral':
            return '"' + node.value + '"';
        
        // 不可识别，还是抛异常
        default:
            throw new TypeError(node.type);
    }
}