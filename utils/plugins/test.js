const { transformSync } = require('@swc/core')
const Visitor = require('@swc/core/Visitor').default

class SWCPlugin extends Visitor {
  visitProgram(e) {
    console.log(e.body[0].expression)
    return e
  }
}

const out = transformSync(
  `
(function(){
  var _assign = require('object-assign');
})()
`,
  {
    plugin: (m) => new SWCPlugin().visitProgram(m),
    jsc: {
      target: 'es2016',
    },
  }
)

console.log(out)
