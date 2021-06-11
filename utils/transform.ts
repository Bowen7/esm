import { build } from 'esbuild'
import { transform as swcTransform } from '@swc/core'
import fetch from 'node-fetch'
import fs from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import createEsmPlugin, { createUnbundledPlugin } from './plugins/esbuild'
import SWCPlugin, { ImportMap } from './plugins/swc'

const baseUrl = 'https://cdn.jsdelivr.net/npm/'

const getMeta = async (name: string, version: string) => {
  const packageUrl = baseUrl + name + (version ? '@' + version : '')
  const packageJsonUrl = packageUrl + '/package.json'
  const res = await fetch(packageJsonUrl)
  const content = await res.json()
  const { peerDependencies } = content
  return {
    main: new URL(
      content.module || content.main || 'index.js',
      packageJsonUrl
    ).toString(),
    peerDependencies,
  }
}

const getTargetUrl = async (name, version, subModule) => {
  const packageUrl = baseUrl + name + (version ? '@' + version : '')
  const packageJsonUrl = packageUrl + '/package.json'
  return new URL(subModule, packageJsonUrl).toString()
}

const transform = async ({ name, subModule, version, type, bundle, host }) => {
  let { main: entryUrl, peerDependencies = {} } = await getMeta(name, version)
  if (subModule) {
    entryUrl = await getTargetUrl(name, version, subModule)
  }
  if (type !== '.js') {
    const res = await fetch(entryUrl)
    return await res.text()
  }

  const res = await fetch(entryUrl)
  let source = await res.text()

  const importMap: ImportMap = new Map()
  ;({ code: source } = await swcTransform(source, {
    jsc: {
      target: 'es2016',
      transform: {
        optimizer: {
          globals: {
            vars: {
              'process.env.NODE_ENV': 'production',
            },
          },
        },
      },
    },
  }))
  ;({ code: source } = await swcTransform(source, {
    plugin: (m) => new SWCPlugin(importMap).visitProgram(m),
    jsc: {
      target: 'es2016',
    },
  }))

  let importCode = ''
  importMap.forEach((value, key) => {
    const { useDefault, id } = value
    importCode += `import * as ${id} from "${key}";`
    if (useDefault) {
      importCode += `const DEFAULT_${id} = ${id}.default;`
    }
  })
  source = importCode + source

  const entry = path.resolve(tmpdir(), 'entry.js')
  fs.writeFileSync(entry, source)

  const dist = path.resolve(tmpdir(), 'dist.js')

  try {
    await build({
      entryPoints: [entry],
      outfile: dist,
      bundle: true,
      format: 'esm',
      minify: true,
      plugins: [createUnbundledPlugin(host, entryUrl)],
    })
  } catch (error) {
    console.log(error)
  }
  const code = fs.readFileSync(dist, 'utf8')
  return code
}

export default transform
