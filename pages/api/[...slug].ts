import { NextApiRequest, NextApiResponse } from 'next'
import { parse, setHeader, transform } from '../../utils'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { name, version, subModule, type, bundle } = parse(req.query)

  setHeader(res, type)

  const code = await transform({ name, subModule, version, type, bundle })
  res.end(code)
}
