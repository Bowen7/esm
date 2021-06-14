import path from 'path'
type Query = {
  bundle: boolean
}
const defaultQuery: Query = {
  bundle: false,
}

const urlRegex = /\/((?:@[a-z]+\/)?[a-z-]+)(?:@(.+))?(\/.+)?/

const parseQuery = (query: { [key: string]: string }): Query => {
  const _query: Partial<Query> = {}
  for (let key in defaultQuery) {
    if (!(key in query)) {
      continue
    }
    const item = defaultQuery[key]
    if (typeof item === 'boolean') {
      _query[key] = true
    } else if (typeof item === 'string') {
      _query[key] = query[key]
    } else if (Array.isArray(item)) {
      _query[key] = query[key].split(',')
    }
  }
  return { ...defaultQuery, ..._query }
}

export const parseUrl = (url: string) => {
  const [, name, version = '', subModule = ''] = url.match(urlRegex)
  const type = path.extname(subModule) || '.js'
  return { name, version, subModule, type }
}

const parse = (url: string, query: { [key: string]: string }) => {
  return {
    ...parseUrl(url),
    ...parseQuery(query as { [key: string]: string }),
  }
}

export default parse
