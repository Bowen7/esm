import path from 'path'
type Query = {
  bundle: boolean
}
const defaultQuery: Query = {
  bundle: false,
}

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

const parseSlugs = (slugs: string[]) => {
  const result = {
    name: '',
    version: '',
    subModule: '',
    type: '.js',
  }
  if (slugs.length > 1 && slugs[0].indexOf('@') === 0) {
    const [name, version = ''] = slugs[1].split('@')
    result.name = slugs[0] + '/' + name
    result.version = version
    result.subModule = slugs.slice(2).join('/')
  } else {
    const [name, version = ''] = slugs[0].split('@')
    result.name = name
    result.version = version
    result.subModule = slugs.slice(1).join('/')
  }
  result.type = path.extname(result.subModule) || '.js'
  return result
}

const parse = (query: { [key: string]: string }, slugs: string[]) => {
  return {
    ...parseSlugs(slugs as string[]),
    ...parseQuery(query as { [key: string]: string }),
  }
}

export default parse
