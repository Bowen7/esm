import { CallExpression, Expression, Program } from '@swc/core'
import Visitor from '@swc/core/Visitor'

class SWCPlugin extends Visitor {
  visitProgram(n: Program): Program {
    console.log(n)
    return n
  }
}
export default SWCPlugin
