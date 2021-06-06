import path from 'path'
const queryScheme = {
  bundle: Boolean,
}

const parseQuery = (query) => {
  const result = {}
  Object.keys(queryScheme).forEach((key) => {
    const type = queryScheme[key]
    switch (type) {
      case Boolean:
        if (Object.prototype.hasOwnProperty.call(query, key)) {
          result[key] = true
        } else {
          result[key] = false
        }
        break
      case String:
        if (Object.prototype.hasOwnProperty.call(query, key)) {
          result[key] = query[key]
        } else {
          result[key] = ''
        }
        break
      case Array:
        if (Object.prototype.hasOwnProperty.call(query, key)) {
          result[key] = query[key].split(',')
        } else {
          result[key] = []
        }
        break
      default:
        break
    }
  })
  return result
}

const parseSlug = (slug) => {
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

const parse = (queryWithSlug) => {
  const { slug, ...query } = queryWithSlug
  return {
    ...parseSlug(slug),
    ...parseQuery(query),
  }
}

export default parse
