import {  VercelResponse } from '@vercel/node'
const setHeader = (res: VercelResponse, type = '') => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  switch (type) {
    case '.css':
      res.setHeader('Content-Type', 'text/css; charset=utf-8')
      break
    default:
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      break
  }
}
export default setHeader
