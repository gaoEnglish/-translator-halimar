/**
 * ============================================================================
 *                                   (/^^)/
 *                                   分词器
 * ============================================================================
 */

/**
 * 我们将从编译器的第一阶段词法分析开始，即分词器。
 *
 * 首先将字符串代码切分成一个token组成的数组
 *
 *   (add 2 (subtract 4 2))   =>   [{ type: 'paren', value: '(' }, ...]
 */

// 输入一个字符串代码，然后我们要先做两件事：
function tokenizer(input){
    //  `current` 变量的作用是指向处理字符串的位置，就像一个指针
    let current = 0;


    // 用来存放token的数组
    let tokens = [];


    // 我们将用一个while循环，在循环里面控制current值的增长来遍历处理字符串代码
    //用循环的原因的是因为token的长度可以是任意长度的  
    //
    while (current < input.length){

        // 将current作为input的索引
        let char = input[current];
        
        //过滤空格
        let WHITESPACE = /\s/;
        if (WHITESPACE.test(char)) {
            current++;
            continue;
        }

        //最后匹配的类型是一个'name'类型，这是一个字母序列，名字是我们的lisp语法的函数名
        //   (add 2 4)
        //    ^^^
        //    Name token
        //
        let LETTERS = /[a-z]/i;
        if (LETTERS.test(char)) {
            let value = '';

            //  循环将所有字母合成一个value
            while (LETTERS.test(char)) {
                value += char;
                char = input[++current];
            }

            // 将value存储到tokens
            tokens.push({ type: 'name', value });

            continue;
        }

        // 下面我们检测类型是数字的token,这个和之前的处理不同，因为数字可以是任意多个数字字符的组合，我们的目的是捕获到这个数字序列作为一个token
        //
        //   (add 123 456)
        //        ^^^ ^^^
        //   只有两个独立的token
        //
        //  先匹配第一个遇到的数字
        let NUMBERS = /[0-9]/;
        if (NUMBERS.test(char)) {

            // 先初始化一个value变量，用来存数字
            let value = '';

            // 我们将用一个循环来处理数字序列，直到遇到不是数字的字符，将value存到tokens数组，并且使current自增
            while (NUMBERS.test(char)) {
                value += char;
                char = input[++current];
            }
            tokens.push({ type: 'number', value });
            continue;
        }

        // 我们同样支持被双引号包括的字符串
        //
        //   (concat "foo" "bar")
        //            ^^^   ^^^ string tokens
        //
        // 首先匹配开双引号
        if (char === '"') {
            // 用来存字符串的变量
            let value = '';
    
            // 跳过开双引号
            char = input[++current];
    
            // 我们将迭代处理每个字符直到遇到另外一个双引号
            while (char !== '"') {
            value += char;
            char = input[++current];
            }
    
            // 跳过双引号
            char = input[++current];
    
            // 将字符串存储到tokens
            tokens.push({ type: 'string', value });
    
            continue;
        }
        
        /*if(char === 'query'){

        }*/
        
        // 如果有不能识别的字符，我们将抛出异常
        throw new TypeError('未知标识符: ' + char);

    }
    // 最后返回tokens数组
    return tokens;
}



module.exports={tokenizer}