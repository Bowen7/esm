import nodeFetch from 'node-fetch'
import path from 'path'
const baseUrl = 'https://cdn.jsdelivr.net/npm/'
const createEsmPlugin = () => {
  return {
    name: 'esm-plugin',
    setup(build) {
      build.onResolve({ filter: /^https?:\/\// }, (args) => ({
        path: args.path,
        namespace: 'http-url',
      }))

      build.onResolve({ filter: /.*/, namespace: 'http-url' }, (args) => {
        let newPath = ''
        if (['.'].includes(args.path[0])) {
          newPath = new URL(args.path, args.importer).toString()
        } else {
          newPath = new URL(args.path, baseUrl).toString()
        }
        return {
          path: newPath,
          namespace: 'http-url',
        }
      })

      build.onLoad({ filter: /.*/, namespace: 'http-url' }, async (args) => {
        async function fetch(url, times) {
          let _url = url
          const extname = path.extname(url)
          if (extname !== '.js') {
            _url += '.js'
          }
          const res = await nodeFetch(_url)
          if ([301, 302, 307].includes(res.status)) {
            return fetch(res.headers.location)
          } else if (res.status === 200) {
            return res.text()
          } else if (res.status === 404 && extname !== '.js') {
            return fetch(url + '/index.js')
          }
          return ''
        }
        const contents = await fetch(args.path, 0)
        return { contents }
      })
    },
  }
}

export default createEsmPlugin
