import { build } from 'esbuild'
import fs from 'fs'
import { tmpdir } from 'os'
import path from 'path'

const transform = async ({ name, subModule, type, bundle }) => {
  let targetFile = ''
  if (subModule) {
    targetFile = path.resolve(
      tmpdir(),
      'node_modules/' + name + '/' + subModule
    )
  } else {
    const packageJsonFile = path.join(
      tmpdir(),
      'node_modules/' + name + '/package.json'
    )
    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonFile, 'utf8').toString()
    )

    targetFile = path.join(
      tmpdir(),
      './node_modules/' + name + '/' + subModule,
      packageJson.main
    )
  }

  if (type !== '.js') {
    const code = fs.readFileSync(targetFile, 'utf8')
    return code
  }
  try {
    await build({
      entryPoints: [targetFile],
      outfile: path.resolve(tmpdir(), 'out.js'),
      bundle,
      format: 'esm',
      minify: true,
    })
  } catch (error) {
    console.log(error)
  }
  const code = fs.readFileSync(path.resolve(tmpdir(), 'out.js'), 'utf8')
  return code
}
export default transform
