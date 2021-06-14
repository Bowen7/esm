import { VercelRequest, VercelResponse } from '@vercel/node'
import { parse, setHeader, transform } from '../utils'
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers['x-forwarded-host'] || req.headers['host']
  const { url, query } = req
  const { name, version, subModule, type, bundle } = parse(
    url,
    query as { [key: string]: string }
  )

  setHeader(res, type)

  const code = await transform({
    url,
    name,
    subModule,
    version,
    type,
    host,
  })

  res.end(code)
}
