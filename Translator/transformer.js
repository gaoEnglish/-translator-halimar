/**
 * ============================================================================
 *                                 ⌒(❀>౪<❀)⌒
 *                               转盘!!!
 * ============================================================================
 */

/**
 * 现在AST出来了，我们想用一个访问者来访问所有不同类型的节点，并且访问者有各种方法能够处理各种不同类型的节点
 *   traverse(ast, {
 *     Program(node, parent) {
 *       // ...
 *     },
 *
 *     CallExpression(node, parent) {
 *       // ...
 *     },
 *
 *     NumberLiteral(node, parent) {
 *       // ...
 *     },
 *   });
 */

module.exports={ transformer }

// 因此我们定义了一个转化器函数，参数是ast和visito，里面我们会再定义两个函数

function traverser(ast, visitor){
      //  `traverseArray` 函数的左右是遍历处理数组，里面调用了下面定义的traverseNode函数.
      function traverseArray(array, parent) {
        array.forEach(child => {
          traverseNode(child, parent);
        });
      }
      // `traverseNode` 参数是节点和它的父节点，因此它可以通过我们的访问者函数
      function traverseNode(node, parent) {

            //我们先检查特定类型的访问者方法是否存在
            let methods = visitor[node.type];
            // 如果methods的enter方法存在，我们将调用它，参数是节点和其父节点
            if (methods && methods.enter) {
                methods.enter(node, parent);
            }

            // 下一步我们根据不同类型进行不同处理
            switch (node.type) {

                // 从顶层的`Program`类型开始， 因为Program节点有body属性，并且那是一个数组，我们可以对它调用 `traverseArray` 
                // (要知道`traverseArray` 里面将会调用 `traverseNode` ，因此这里会产生递归遍历）
                case 'Program':
                traverseArray(node.body, node);
                break;
        
                // 现在对`CallExpression` 和它的参数 `params`进行相同的操作
                case 'CallExpression':
                traverseArray(node.params, node);
                break;
        
                // 对 `NumberLiteral` 和`StringLiteral` 类型没有子节点需要处理，直接跳过
                case 'NumberLiteral':
                case 'StringLiteral':
                break;
        
                // 不可识别码还是抛异常
                default:
                throw new TypeError(node.type);
            }
            // 如果methods存在exit方法，调用它
            if (methods && methods.exit) {
                methods.exit(node, parent);
            }
      }
    //最后，我们使用ast调用`traverseNode`来启动遍历器
    //没有`parent`，因为AST的顶层没有父级。
    traverseNode(ast, null);
}
/**
 * ============================================================================
 *                                   ⁽(˃̵͈̑ᴗ˂̵͈̑)⁽
 *                                    转化!!!
 * ============================================================================
 */

/**
 * 下一步，转化器将上一步生成的AST用下面的transformer方法生成一个新的AST
 *
 * ----------------------------------------------------------------------------
 *   Original AST                     |   Transformed AST
 * ----------------------------------------------------------------------------
 *   {                                |   {
 *     type: 'Program',               |     type: 'Program',
 *     body: [{                       |     body: [{
 *       type: 'CallExpression',      |       type: 'ExpressionStatement',
 *       name: 'add',                 |       expression: {
 *       params: [{                   |         type: 'CallExpression',
 *         type: 'NumberLiteral',     |         callee: {
 *         value: '2'                 |           type: 'Identifier',
 *       }, {                         |           name: 'add'
 *         type: 'CallExpression',    |         },
 *         name: 'subtract',          |         arguments: [{
 *         params: [{                 |           type: 'NumberLiteral',
 *           type: 'NumberLiteral',   |           value: '2'
 *           value: '4'               |         }, {
 *         }, {                       |           type: 'CallExpression',
 *           type: 'NumberLiteral',   |           callee: {
 *           value: '2'               |             type: 'Identifier',
 *         }]                         |             name: 'subtract'
 *       }]                           |           },
 *     }]                             |           arguments: [{
 *   }                                |             type: 'NumberLiteral',
 *                                    |             value: '4'
 * ---------------------------------- |           }, {
 *                                    |             type: 'NumberLiteral',
 *                                    |             value: '2'
 *                                    |           }]
 *  (对不起，另一个更长.)               |         }
 *                                    |       }
 *                                    |     }]
 *                                    |   }
 * ----------------------------------------------------------------------------
 */
// transformer 方法，参数是lisp ast.
function transformer(ast){

    // 用一个结构和之前的ast相似的变量来存信的ast
    let newAst = {
        type: 'Program',
        body: [],
    };
    //接下来，我将作弊一些并创建一些技巧。 我们要去
    //在要推送的父节点上使用名为`context`的属性
    //与其父节点的上下文关联的节点。 通常情况下你会更好
    //比这要抽象的多，但是出于我们的目的，这使事情变得简单。
    //
    //只需注意上下文是从旧ast到*的引用
    //新AST。
    ast._context = newAst.body;

    // 调用traverser 函数，参数是ast和visitor.
    traverser(ast,{
        // visitor方法可以处理所有 `NumberLiteral`类型
        NumberLiteral:{
            // 用enter访问它们.
            enter(node, parent){
                // 创建一个新的节点，类型也叫 `NumberLiteral` ，把它入栈parent context.
                parent._context.push({
                    type: 'NumberLiteral',
                    value: node.value,
                });
            },
        },
        // 下一步处理`StringLiteral`类型
        StringLiteral:{
            enter(node, parent){
                parent._context.push({
                    type: 'StringLiteral',
                    value: node.value,
                });
            },
        },

        //接下来是`CallExpression`。
        CallExpression:{
            enter(node, parent){
                 //创建一个新的节点，类型为`CallExpression` 并且嵌套了一个`Identifier`类型
                let expression = {
                    type: 'CallExpression',
                    callee: {
                      type: 'Identifier',
                      name: node.name,
                    },
                    arguments: [],
                };
                //下一步我们定义一个新的context变量用来指向表达式的参数
                node._context = expression.arguments;

                //如果检测到父节点是否 `CallExpression`类型
                // 如果不是
                if (parent.type !== 'CallExpression') {
                    // 我们将用一个表达式声明把调用表达式包起来，这样做的原因是在JS顶层调用表达式是需要声明的
                    expression = {
                        type: 'ExpressionStatement',
                        expression: expression,
                    };
                }

                // 将 `CallExpression`推入parent._context
                parent._context.push(expression);
            }
        }
    });

    // transformer函数的最后我们返回刚刚创建的新AST
    return newAst;
}