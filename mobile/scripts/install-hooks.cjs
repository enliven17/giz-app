const { execFileSync } = require("node:child_process");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const existing = (() => {
  try {
    return execFileSync("git", ["config", "--get", "core.hooksPath"], {
      cwd: root,
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
})();
if (existing && existing !== "mobile/.husky/_") {
  throw new Error(`Existing hooks at ${existing}; integrate them before installing mobile hooks.`);
}
process.chdir(root);
import("husky").then(({ default: husky }) => {
  const result = husky("mobile/.husky");
  if (result) throw new Error(result);
});
