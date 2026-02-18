import { runCommandWithBun } from "./run-with-bun.js";
import { versionPackages } from "./version-packages.js";
import { run } from "cmd-ts";

const newVersion = await run(versionPackages, process.argv);
if (!newVersion) {
  console.error("Versioning packages failed");
  process.exit(1);
}

console.log("Staging new versions with git...");
const stageChangesResult = runCommandWithBun([
  "git",
  "add",
  ":(glob)**/package.json",
]);

if (stageChangesResult.exitCode !== 0) {
  console.error("Failed to stage changes with git");
  console.error(stageChangesResult.stderr);
  process.exit(1);
}

console.log("Committing changesg with git...");

const commitChangesResult = runCommandWithBun([
  "git",
  "commit",
  "--message",
  `chore(release): publish ${newVersion}`,
]);

if (commitChangesResult.exitCode !== 0) {
  console.error("Failed to commit changes with git");
  console.error(commitChangesResult.stderr);
  process.exit(1);
}
