"use strict";
// n: Nml
// i: Ide
// e: Exp = n | i |  true |  false | uop e | e bop e | i e* | e ? e : e | [ e* ]  | e [e]
// s:-Stm =  let i = e | func i i* = e | i = e |  print e | while e b
// b: Block = block s*
// p: Program  program b
let Memory = new Map();
class Program {
    body;
    constructor(body) {
        this.body = body;
    }
    interpret() {
        this.body.interpret();
    }
}
class Block {
    statements;
    constructor(statements) {
        this.statements = statements;
    }
    interpret() {
        for (const statement of this.statements) {
            statement.interpret();
        }
    }
}
class Assignment {
    target;
    source;
    constructor(target, source) {
        this.target = target;
        this.source = source;
    }
    interpret() {
        if (!Memory.has(this.target.name)) {
            throw new Error("Variable not declared.");
        }
        Memory.set(this.target.name, this.source.interpret());
    }
}
class VariableDeclaration {
    id;
    initializer;
    constructor(id, initializer) {
        this.id = id;
        this.initializer = initializer;
    }
    interpret() {
        if (Memory.has(this.id.name)) {
            throw new Error("Variable already declared.");
        }
        Memory.set(this.id.name, this.initializer.interpret());
    }
}
class FunctionDeclaration {
    id;
    parameters;
    expression;
    constructor(id, parameters, expression) {
        this.id = id;
        this.parameters = parameters;
        this.expression = expression;
    }
    interpret() {
        if (Memory.has(this.id.name)) {
            throw new Error("Function already declared.");
        }
        Memory.set(this.id.name, [this.parameters, this.expression]);
    }
}
class PrintStatement {
    expression;
    constructor(expression) {
        this.expression = expression;
    }
    interpret() {
        console.log(this.expression.interpret());
    }
}
class WhileStatement {
    condition;
    body;
    constructor(condition, body) {
        this.condition = condition;
        this.body = body;
    }
    interpret() {
        while (this.condition.interpret()) {
            this.body.interpret();
        }
    }
}
class Identifier {
    name;
    constructor(name) {
        this.name = name;
    }
    interpret() {
        if (!Memory.has(this.name)) {
            throw new Error("Variable not declared.");
        }
        return Memory.get(this.name);
    }
}
class Numeral {
    value;
    constructor(value) {
        this.value = value;
    }
    interpret() {
        return this.value;
    }
}
class BinaryExpression {
    left;
    operator;
    right;
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    interpret() {
        switch (this.operator) {
            case "<":
                return this.left.interpret() < this.right.interpret();
            case ">":
                return this.left.interpret() > this.right.interpret();
            case "<=":
                return this.left.interpret() <= this.right.interpret();
            case ">=":
                return this.left.interpret() >= this.right.interpret();
            case "==":
                return this.left.interpret() === this.right.interpret();
            case "!=":
                return this.left.interpret() !== this.right.interpret();
        }
    }
}
class UnaryExpression {
    operator;
    argument;
    constructor(operator, argument) {
        this.operator = operator;
        this.argument = argument;
    }
    interpret() {
        switch (this.operator) {
            case "-":
                return -this.argument.interpret();
            case "!":
                return !this.argument.interpret();
        }
    }
}
class BooleanLiteral {
    value;
    constructor(value) {
        this.value = value;
    }
    interpret() {
        return this.value;
    }
}
class CallExpression {
    callee;
    args;
    constructor(callee, args) {
        this.callee = callee;
        this.args = args;
    }
    interpret() {
        const value = Memory.get(this.callee.name);
        if (typeof value === "function") {
            const args = this.args.map(arg => arg.interpret());
            return value(...args);
        }
    }
}
class ConditionalExpression {
    test;
    consequent;
    alternate;
    constructor(test, consequent, alternate) {
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
    }
    interpret() {
        return this.test.interpret()
            ? this.consequent.interpret()
            : this.alternate.interpret();
    }
}
class ArrayExpression {
    elements;
    constructor(elements) {
        this.elements = elements;
    }
    interpret() {
        return this.elements.map(element => element.interpret());
    }
}
class SubscriptExpression {
    array;
    index;
    constructor(array, index) {
        this.array = array;
        this.index = index;
    }
    interpret() {
        const array = this.array.interpret();
        const index = this.index.interpret();
        return array[index];
    }
}
// RUN the interpreter
const sample = new Program(new Block([
    new VariableDeclaration(new Identifier("x"), new Numeral(0)),
    new WhileStatement(new BinaryExpression(new Identifier("x"), "<", new Numeral(10)), new Block([
        new Assignment(new Identifier("x"), new Numeral(300)),
        new PrintStatement(new Identifier("x"))
    ]))
]));
//make sample2  -10
const sample2 = new Program(new Block([
    new PrintStatement(new UnaryExpression("-", new Numeral(10)))
]));
// make sample3  10 == 10
const sample3 = new Program(new Block([
    new Assignment(new Identifier("x"), new Numeral(10)),
    new PrintStatement(new BinaryExpression(new Identifier("x"), "==", new Numeral(10)))
]));
function interpret(program) {
    return program.interpret();
}
interpret(sample);
interpret(sample2);
interpret(sample3);
