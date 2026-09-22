const { execFileSync, spawnSync } = require("node:child_process");
const path = require("node:path");
const mobile = path.resolve(__dirname, "..");
const paths = execFileSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"], {
  cwd: path.dirname(mobile),
  encoding: "utf8",
})
  .split("\0")
  .filter((file) => file.startsWith("mobile/"))
  .map((file) => file.slice(7));
if (!paths.length) process.exit(0);
function run(bin, args) {
  const result = spawnSync(process.execPath, [path.join(mobile, "node_modules", bin), ...args], {
    cwd: mobile,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run("prettier/bin/prettier.cjs", ["--check", "--ignore-unknown", ...paths]);
const source = paths.filter((file) => /\.[cm]?[jt]sx?$/.test(file));
if (source.length) run("eslint/bin/eslint.js", ["--max-warnings", "0", ...source]);
// Tests and full-source checks belong in CI; this hook never rewrites files.
