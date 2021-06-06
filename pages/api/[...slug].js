import { parse, install, setHeader, transform } from '../../utils'
export default async function handler(req, res) {
  const { name, version, subModule, type, bundle } = parse(req.query)

  setHeader(res, type)

  install(name, version)
  // const exampleOnResolvePlugin = {
  //   name: 'example',
  //   setup(build) {
  //     build.onResolve({ filter: /^react/ }, (args) => {
  //       console.log(123, args)
  //       // return { path: args.path }
  //       return {
  //         path: path.join(args.resolveDir, 'public', args.path),
  //         external: true,
  //       }
  //     })
  //   },
  // }

  const code = await transform({ name, subModule, type, bundle })
  res.end(code)
}
