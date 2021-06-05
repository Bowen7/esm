const fs = require("fs")
const path = require("path")
const pnpmPath = require.resolve("pnpm/dist/pnpm.cjs")
const code = fs.readFileSync(pnpmPath, "utf8").toString()
fs.writeFileSync(
  path.resolve("lib/pnpm.js"),
  `\
const run = (argv) => {
  console.log(process.argv)
  process.argv = process.argv.concat(argv)
  ${code}
}
module.exports = run
`
)
