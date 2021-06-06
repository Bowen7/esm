import path from 'path'
import { tmpdir } from 'os'
import fse from 'fs-extra'
import { execSync } from 'child_process'
const install = (name = '', version = '') => {
  const pnpmPath = path.resolve(process.cwd(), 'pnpm')
  const destPnpmPath = path.resolve(tmpdir(), 'pnpm')
  fse.copySync(pnpmPath, destPnpmPath)

  try {
    const out = execSync(
      `HOME=${tmpdir} node ${destPnpmPath}/dist/pnpm.cjs install ` +
        `${name}${version ? '@' + version : ''} --dir ${tmpdir()}`,
      { cwd: tmpdir() }
    )
    console.log(out.toString())
  } catch (error) {
    console.log(error)
  }
}
export default install
