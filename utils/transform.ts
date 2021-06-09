import { build } from 'esbuild'
import fetch from 'node-fetch'
import fs from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import createEsmPlugin from './plugins/esbuild'

const baseUrl = 'https://cdn.jsdelivr.net/npm/'

const getMeta = async (name: string, version: string) => {
  const packageUrl = baseUrl + name + (version ? '@' + version : '')
  const packageJsonUrl = packageUrl + '/package.json'
  const res = await fetch(packageJsonUrl)
  const content = await res.json()
  const { peerDependencies } = content
  return {
    main: new URL(content.module || content.main, packageJsonUrl).toString(),
    peerDependencies,
  }
}

const getTargetUrl = async (name, version, subModule) => {
  const packageUrl = baseUrl + name + (version ? '@' + version : '')
  const packageJsonUrl = packageUrl + '/package.json'
  return new URL(subModule, packageJsonUrl).toString()
}

const transform = async ({ name, subModule, version, type, bundle }) => {
  let { main: entryUrl, peerDependencies = {} } = await getMeta(name, version)
  if (subModule) {
    entryUrl = await getTargetUrl(name, version, subModule)
  }
  if (type !== '.js') {
    const res = await fetch(entryUrl)
    return await res.text()
  }
  try {
    await build({
      entryPoints: [entryUrl],
      outfile: path.resolve(tmpdir(), 'out.js'),
      bundle: true,
      format: 'esm',
      minify: true,
      plugins: [createEsmPlugin()],
      external: Object.keys(peerDependencies),
    })
  } catch (error) {
    console.log(error)
  }
  const code = fs.readFileSync(path.resolve(tmpdir(), 'out.js'), 'utf8')
  return code
}

export default transform
