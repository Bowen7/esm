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

const parseSlug = (slug: string[]) => {
  const result = {
    name: '',
    version: '',
    subModule: '',
    type: '.js',
  }
  if (slug.length > 1 && slug[0].indexOf('@') === 0) {
    const [name, version = ''] = slug[1].split('@')
    result.name = slug[0] + '/' + name
    result.version = version
    result.subModule = slug.slice(2).join('/')
  } else {
    const [name, version = ''] = slug[0].split('@')
    result.name = name
    result.version = version
    result.subModule = slug.slice(1).join('/')
  }
  result.type = path.extname(result.subModule) || '.js'
  return result
}

const parse = (queryWithSlug: { [key: string]: string | string[] }) => {
  const { slug, ...query } = queryWithSlug
  return {
    ...parseSlug(slug as string[]),
    ...parseQuery(query as { [key: string]: string }),
  }
}

export default parse
