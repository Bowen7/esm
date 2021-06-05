import { transformSync, buildSync } from "esbuild"
import resolvePkg from "resolve-pkg"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true)
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/javascript; charset=utf-8")

  const { slug } = req.query
  // TODO: Organization, Version ...
  const packageName = slug[0]

  const pnpmPath = resolvePkg("pnpm/bin/pnpm.cjs")
  execSync(`node ${pnpmPath} install ${packageName} --dir ${__dirname}`)
  fs.writeFileSync(
    path.resolve(__dirname, "in.js"),
    `export { default } from "lodash"`
  )
  buildSync({
    entryPoints: [path.resolve(__dirname, "in.js")],
    outfile: path.resolve(__dirname, "out.js"),
    bundle: true,
    format: "esm",
    minify: true,
  })
  const code = fs.readFileSync(path.resolve(__dirname, "out.js"), "utf8")
  res.end(code)
}
