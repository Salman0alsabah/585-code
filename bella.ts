// n: Nml
// i: Ide
// e: Exp = n | i |  true |  false | uop e | e bop e | i e* | e ? e : e | [ e* ]  | e [e]
// s:-Stm =  let i = e | func i i* = e | i = e |  print e | while e b
// b: Block = block s*
// p: Program  program b

type Value = number | boolean | Value[] | ((...args: number[] )=> Value) | [Identifier[], Expression] | undefined; 
let Memory = new Map<string, Value>();

class Program {
    constructor(public body: Block) {}
    interpret() : void {
      this.body.interpret();
    }
  }
  

  class Block {
    constructor(public statements: Statement[]) {}
    interpret() : void {
      for (const statement of this.statements) {
        statement.interpret();
      }
    }
  }
  
  interface Statement {
    interpret(): void;
    }
  
  class Assignment implements Statement {
    constructor(public target: Identifier, public source: Expression) {}
    interpret() : void {
      if (!Memory.has(this.target.name)) {
        throw new Error("Variable not declared.");
      }
      Memory.set(this.target.name, this.source.interpret());
    }
  }
  
  class VariableDeclaration implements Statement {
    constructor(public id: Identifier, public initializer: Expression) {}
    interpret() : void { 
      if (Memory.has(this.id.name)) {
        throw new Error("Variable already declared.");
      } 
      Memory.set(this.id.name, this.initializer.interpret());
    }
  }
  
  class FunctionDeclaration implements Statement {
    constructor(public id: Identifier, public parameters: Identifier[],  public expression: Expression) {}
    interpret() : void {
      if (Memory.has(this.id.name)) {
        throw new Error("Function already declared.");
      }
      Memory.set(this.id.name, [this.parameters, this.expression]);
    }
  }

  class PrintStatement implements Statement {
    constructor(public expression: Expression) {}
    interpret() : void {
      console.log(this.expression.interpret());
    }
  }

  class WhileStatement implements Statement {
    constructor(public condition: Expression, public body: Block) {}
    interpret() : void {
      while (this.condition.interpret()) {
        this.body.interpret();
      }
    }
  }

  interface Expression { 
    interpret(): Value;
    }

  class Identifier implements Expression {
    constructor(public name: string) {}
    interpret() : Value {
      if (!Memory.has(this.name)) {
        throw new Error("Variable not declared.");
      }
      return Memory.get(this.name);
    }
  }

  class Numeral implements Expression {
    constructor(public value: number) {}
    interpret() : Value {
      return this.value;
    }
  }

  class BinaryExpression implements Expression {
    constructor(public left: Expression, public operator: string, public right: Expression) {}
    interpret() : Value {
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

  class UnaryExpression implements Expression {
    constructor(public operator: string, public argument: Expression) {}
    interpret() : Value {
      switch (this.operator) {
        case "-":
          return -this.argument.interpret();
        case "!":
          return !this.argument.interpret();
      }
    }
  }

  class BooleanLiteral implements Expression {
    constructor(public value: boolean) {}
    interpret() : Value {
      return this.value;
    }
  }

  class CallExpression implements Expression {
    constructor(public callee: Identifier, public args: Expression[]) {}
    interpret() : Value {
      const value = Memory.get(this.callee.name);
      if (typeof value === "function") {
        const args = this.args.map(arg => arg.interpret());
        return value(...args);
      }
    }
  }


  class ConditionalExpression implements Expression {
    constructor(public test: Expression, public consequent: Expression, public alternate: Expression) {}
    interpret() : Value {
      return this.test.interpret() 
      ? this.consequent.interpret() 
      : this.alternate.interpret();
    }
  }
  


  class ArrayExpression implements Expression {
    constructor(public elements: Expression[]) {}
    interpret() : Value {
      return this.elements.map(element => element.interpret());
    }
  }

  class SubscriptExpression implements Expression {
    constructor(public array: Expression, public index: Expression) {}
    interpret() : Value {
      const array = this.array.interpret();
      const index = this.index.interpret();
      return array[index];
    }
  }


 
// RUN the interpreter

  const sample = new Program(
    new Block([
      new VariableDeclaration(new Identifier("x"), new Numeral(0)),
      new WhileStatement(
        new BinaryExpression(new Identifier("x"), "<", new Numeral(10)),
        new Block([
          new Assignment(new Identifier("x"),new Numeral(300)),
          new PrintStatement(new Identifier("x"))
        ])
      )
    ])
  );

 //make sample2  -10
  const sample2 = new Program(
    new Block([
      new PrintStatement(
        new UnaryExpression("-", new Numeral(10))
      )
    ])
  );


  // make sample3  10 == 10
  const sample3 = new Program(
    new Block([
      new Assignment(new Identifier("x"), new Numeral(10)),
      new PrintStatement(
        new BinaryExpression(new Identifier("x"), "==", new Numeral(10))
      )
    ])
  );

  function interpret(program: Program) {
    return program.interpret();
  }
 
  interpret(sample);
  interpret(sample2);
  interpret(sample3);