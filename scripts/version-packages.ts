import { binary, command, oneOf, option, run } from "cmd-ts";
import { runCommandWithBun } from "./run-with-bun.js";

const versionPackagesCommand = command({
  name: "version-packages",
  description: "Update package versions in the monorepo",
  args: {
    releaseType: option({
      type: oneOf(["patch", "minor", "major"]),
      long: "release-type",
      defaultValue: () => "patch" as const,
      defaultValueIsSerializable: true,
    }),
  },
  handler: async (args) => {
    console.log({ args });
    const { releaseType } = args;
    const cmd = [
      "pnpm",
      "--recursive",
      "exec",
      "pnpm",
      "version",
      releaseType,
      "--no-git-tags",
    ];
    const result = runCommandWithBun(cmd);
    if (result.exitCode !== 0) {
      throw new Error(result.stderr.toString());
    }
    const newVersion = result.stdout.toString().split("\n")[0];

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

    const pushChangesResult = runCommandWithBun([
      "git",
      "push",
      "origin",
      "HEAD",
    ]);

    if (pushChangesResult.exitCode !== 0) {
      console.error("Failed to push changes with git");
      console.error(pushChangesResult.stderr);
      process.exit(1);
    }
  },
});

const versionPackages = binary(versionPackagesCommand);

await run(versionPackages, process.argv);
