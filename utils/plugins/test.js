const { transformSync } = require('@swc/core')
const Visitor = require('@swc/core/Visitor').default
class SWCPlugin extends Visitor {}

const { code } = transformSync(
  `
  const arr = [1, 2, 3]
`,
  {
    plugin: (m) => new SWCPlugin().visitProgram(m),
  }
)
console.log(code)
