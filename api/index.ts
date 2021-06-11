import { VercelRequest, VercelResponse } from '@vercel/node'
import { parse, setHeader, transform } from '../utils'
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers['x-forwarded-host'] || req.headers['host']
  const slugs = req.url.split('/').slice(1)
  const { name, version, subModule, type, bundle } = parse(
    req.query as { [key: string]: string },
    slugs
  )

  setHeader(res, type)

  const code = await transform({ name, subModule, version, type, bundle, host })

  res.end(code)
}
