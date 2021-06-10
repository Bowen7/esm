import {
  Program,
  VariableDeclarator,
  AssignmentExpression,
  CallExpression,
  Expression,
  Identifier,
} from '@swc/core'
import Visitor from '@swc/core/Visitor'
import { customAlphabet } from 'nanoid/non-secure'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10)

export type ImportMap = Map<string, { useDefault: boolean; id: string }>
class SWCPlugin extends Visitor {
  importMap: ImportMap
  useDefault: boolean
  constructor(importMap: ImportMap) {
    super()
    this.importMap = importMap
  }
  visitProgram(n: Program): Program {
    let program: Program
    switch (n.type) {
      case 'Module':
        program = this.visitModule(n)
        break
      case 'Script':
        program = this.visitScript(n)
        break
    }
    return program
  }
  visitVariableDeclarator(variableDeclarator: VariableDeclarator) {
    variableDeclarator.id = this.visitPattern(variableDeclarator.id)
    this.useDefault = variableDeclarator.id.type === 'Identifier'
    variableDeclarator.init = this.visitOptionalExpression(
      variableDeclarator.init
    )
    return variableDeclarator
  }

  visitAssignmentExpression(assignmentExpression: AssignmentExpression) {
    const { left, right } = assignmentExpression
    this.useDefault = left.type === 'Identifier'

    assignmentExpression.left = this.visitPatternOrExpressison(left)
    assignmentExpression.right = this.visitExpression(right)
    return assignmentExpression
  }

  visitCallExpression(callExpression: CallExpression): Expression | Identifier {
    const { span, callee, arguments: args } = callExpression
    if (
      !(
        'value' in callee &&
        callee.value === 'require' &&
        'value' in args[0].expression
      )
    ) {
      callExpression.callee = this.visitExpressionOrSuper(callExpression.callee)
      callExpression.typeArguments = this.visitTsTypeParameterInstantiation(
        callExpression.typeArguments
      )
      if (callExpression.arguments) {
        callExpression.arguments = this.visitArguments(callExpression.arguments)
      }
      return callExpression
    }

    const source = args[0].expression.value + ''

    const useDefault = this.useDefault

    let id: string
    if (!this.importMap.has(source)) {
      id = nanoid()
      this.importMap.set(source, { useDefault, id })
    } else {
      ;({ id } = this.importMap.get(source))
      if (useDefault) {
        this.importMap.set(source, { useDefault, id })
      }
    }

    return {
      type: 'Identifier',
      span: span,
      value: useDefault ? `DEFAULT_${id}` : `${id}`,
      optional: false,
    }
  }
}

export default SWCPlugin
