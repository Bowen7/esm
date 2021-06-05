import { transformSync, buildSync } from "esbuild"
import fs from "fs"
import path from "path"
import fse from "fs-extra"
import { tmpdir } from "os"
import { execSync } from "child_process"
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true)
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/javascript; charset=utf-8")

  const { slug } = req.query
  // TODO: Organization, Version ...
  const packageName = slug[0]

  console.log(1, Date.now())
  const pnpmPath = path.resolve(process.cwd(), "pnpm")
  const destPnpmPath = path.resolve(tmpdir(), "pnpm")
  fse.copySync(pnpmPath, destPnpmPath)

  console.log(2, Date.now())
  try {
    execSync(
      `node ${destPnpmPath}/dist/pnpm.cjs install ${packageName} --dir ${tmpdir()}`,
      __dirname
    )
  } catch (error) {
    console.log(error)
  }

  console.log(3, Date.now())

  fs.writeFileSync(
    path.resolve(tmpdir(), "in.js"),
    `export { default } from "${packageName}"`
  )
  buildSync({
    entryPoints: [path.resolve(tmpdir(), "in.js")],
    outfile: path.resolve(tmpdir(), "out.js"),
    bundle: true,
    format: "esm",
    minify: true,
  })
  const code = fs.readFileSync(path.resolve(tmpdir(), "out.js"), "utf8")
  res.end(code)
}
