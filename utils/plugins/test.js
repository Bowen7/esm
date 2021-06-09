const { transformSync } = require('@swc/core')
const Visitor = require('@swc/core/Visitor').default

let parent = null
let index = 0
class SWCPlugin extends Visitor {
  visitProgram(n) {
    parent = n
    // console.log(JSON.stringify(n))
    switch (n.type) {
      case 'Module':
        return this.visitModule(n)
      case 'Script':
        return this.visitScript(n)
    }
  }

  visitModuleItems(items) {
    return items.map((item, _index) => {
      index = _index
      return this.visitModuleItem(item)
    })
  }

  visitBlockStatement(block) {
    parent = block

    block.stmts = this.visitStatements(block.stmts)

    return block
  }

  visitStatements(stmts) {
    return stmts.map((stmt, _index) => {
      index = _index
      return this.visitStatement(stmt)
    })
  }

  visitIfStatement(stmt) {
    parent = stmt

    stmt.test = this.visitExpression(stmt.test)
    stmt.consequent = this.visitStatement(stmt.consequent)
    stmt.alternate = this.visitOptionalStatement(stmt.alternate)

    return stmt
  }

  visitOptionalStatement(stmt) {
    if (stmt) {
      parent = stmt

      return this.visitStatement(stmt)
    }
  }

  visitLabeledStatement(stmt) {
    parent = stmt

    stmt.label = this.visitLabelIdentifier(stmt.label)
    stmt.body = this.visitStatement(stmt.body)

    return stmt
  }

  visitExpressionStatement(n) {
    return n
  }

  visitVariableDeclaration(n) {
    console.log(123)
    parent.body = []
    // if (parent.type === 'Module') {
    //   const { span } = n
    //   parent.body[index] = {
    //     type: 'ImportDeclaration',
    //     span,
    //     specifiers: [
    //       {
    //         type: 'ImportDefaultSpecifier',
    //         span: {
    //           start: 10,
    //           end: 15,
    //           ctxt: 0,
    //         },
    //         local: {
    //           type: 'Identifier',
    //           span,
    //           value: 'react',
    //           optional: false,
    //         },
    //       },
    //       {
    //         type: 'ImportSpecifier',
    //         span,
    //         local: {
    //           type: 'Identifier',
    //           span,
    //           value: 'r',
    //           optional: false,
    //         },
    //         imported: null,
    //       },
    //     ],
    //     source: {
    //       type: 'StringLiteral',
    //       span,
    //       value: 'react',
    //       hasEscape: false,
    //       kind: {
    //         type: 'normal',
    //         containsQuote: true,
    //       },
    //     },
    //     typeOnly: false,
    //     asserts: null,
    //   }
    // }
    // parent.body = []
    // console.log(parent)
    return n
  }
}

const out = transformSync(
  `
  // import react, {r} from "react"
  const react = require('react')
  // const vue = require('vue').vue
  // {
  //   const { vue } = require('vue');
  // }
  // {
  //   let vue;
  //   ({ vue } = require(vue));
  // }
`,
  {
    plugin: (m) => new SWCPlugin().visitProgram(m),
    jsc: {
      target: 'es2016',
    },
  }
)

console.log(out)
