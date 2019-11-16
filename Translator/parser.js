/**
 * ============================================================================
 *                                 ヽ/❀o ل͜ o\ﾉ
 *                                  语法分析器
 * ============================================================================
 */

/**
 * 接下来我们将把tokens数组解析成AST（抽象语法树）
 *
 *   [{ type: 'paren', value: '(' }, ...]   =>   { type: 'Program', body: [...] }
 */

module.exports={ parser }

// 我们定义一个解析器函数用来处理tokens数组
function parser(tokens){
    // 我们还是用一个current变量作为指针
    let current = 0;

    // 这次我们用递归代替循环，所以我们定义了walk函数
    function walk() {
        // 函数内部的第一步，获取当前处理的token
        let token = tokens[current];

        // 我们将不同类型的token分开
        //首先从数字开始
        
        // 如果是数字
        if( token.type === 'number' ){
            
            // `current`自增
            current++;
            
            // 返回新的AST节点，类型为NumberLiteral，值为token的值
            return {
                type: 'NumberLiteral',
                value: token.value
            }

        }

        //如果遇到的是一个字符串，我们将和处理数字一样
        // `StringLiteral` node.
        if (token.type === 'string') {
            current++;
    
            return {
                type: 'StringLiteral',
                value: token.value,
            };
        }

        //接下来我们匹配调用。处理调用的时候即是当我们遇到开括号的时候
        if (
            token.type === 'paren' &&
            token.value === '('
        ){
            
            // 我们将自增current以跳过括号，因为我们不关心它
            token = tokens[++current];

            // 我们创建一个基本节点，类型为“CallExpression”，我们将把它的名字设置为当前token的值，因为开括号后面的token就是操作的函数名
            let node = {
                type: 'CallExpression',
                name: token.value,
                params: [],
            };

            // 再次自增current，跳过函数名的token
            token = tokens[++current];

            //现在我们将按顺序遍历每一个token，直到遇到了闭括号为止，闭括号之前的这些token将是最近一次调用操作的参数
            // 到此开始进入递归，我们将依靠递归来解决问题，而不是尝试去解析可能掉入无限嵌套的节点集合。
            //
            // 为了解释它，看下面的lisp代码，我们可以看到add的参数是数字2和嵌套的调用(subtract ),这个调用又有自己的两个参数（4和2）
            //   (add 2 (subtract 4 2))
            //
            // 你可能还会注意到在tokens数组中，我们有多个闭括号
            // parenthesis.
            //
            //   [
            //     { type: 'paren',  value: '('        },
            //     { type: 'name',   value: 'add'      },
            //     { type: 'number', value: '2'        },
            //     { type: 'paren',  value: '('        },
            //     { type: 'name',   value: 'subtract' },
            //     { type: 'number', value: '4'        },
            //     { type: 'number', value: '2'        },
            //     { type: 'paren',  value: ')'        }, <<< 右括号
            //     { type: 'paren',  value: ')'        }, <<< 右括号
            //   ]
            //
            // 我们将依赖嵌套的walk函数来增加current变量来遍历所有嵌套的调用
            // 因此我们创建while循环，当它遇到开括号或者闭括号的时候会进入循环
            // 
            // 括号
            while (
                (token.type !== 'paren') ||
                (token.type === 'paren' && token.value !== ')')
            ) {
                // 我们将调用walk方法，它会返回一个节点，我们把它放进node.params
                node.params.push(walk());
                token = tokens[current];
            }

            // 最后我们将自增current，以跳过闭括号
            current++;
            
            // 返回节点
            return node;
        }
        
        // 如果遇到不可识别的token抛出异常
        throw new TypeError(token.type);
    }

    // 现在，我们将创建AST，把根的类型设为Program
    let ast = {
        type: 'Program',
        body: [],
    };
    // 下面我们通过调用walk将节点都存储到ast.body
    //这里用循环的原因是我们的程序有嵌套的调用操作
    //
    //   (add 2 2)
    //   (subtract 4 2)
    //
    while (current < tokens.length) {
        ast.body.push(walk());
    }

    //最后返回AST.
    return ast;
}

