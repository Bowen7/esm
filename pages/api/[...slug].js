import { parse, setHeader, transform } from '../../utils'
export default async function handler(req, res) {
  const { name, version, subModule, type, bundle } = parse(req.query)

  setHeader(res, type)

  const code = await transform({ name, subModule, version, type, bundle })
  res.end(code)
}
