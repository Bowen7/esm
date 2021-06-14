import fetch from 'node-fetch'
import path from 'path'
import { parseUrl } from './parse'
type FileSet = Set<string>
type FileMap = Map<string, FileSet>

const fileMap: FileMap = new Map()

const apiBase = 'https://data.jsdelivr.com/v1/package/npm/'

// TODO: handle version
const completeSubModule = (name: string, subModule: string): string => {
  const fileSet = fileMap.get(name)
  if (fileSet.has(subModule)) {
    return subModule
  }
  if (fileSet.has(subModule + '.js')) {
    return subModule + '.js'
  }
  if (fileSet.has(subModule + '/index.js')) {
    return subModule + '/index.js'
  }
}

const complete = async (url: string): Promise<string> => {
  if (path.extname(url) === '.js') {
    return url
  }
  let { name, version, subModule } = parseUrl(url)
  if (!fileMap.has(name)) {
    let res = await fetch(apiBase + name)
    const version = (await res.json()).tags.latest

    res = await fetch(apiBase + name + '@' + version + '/flat')
    const files = (await res.json()).files
    const fileSet: Set<string> = new Set()
    files.forEach((file) => fileSet.add(file.name))
    fileMap.set(name, fileSet)
  }
  subModule = completeSubModule(name, subModule)
  return '/' + name + (version ? '@' + version : '') + subModule
}
export default complete
