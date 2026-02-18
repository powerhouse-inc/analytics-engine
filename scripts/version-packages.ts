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
    return newVersion;
  },
});

export const versionPackages = binary(versionPackagesCommand);
