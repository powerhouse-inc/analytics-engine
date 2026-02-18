import { binary, command, flag, run } from "cmd-ts";
import { runCommandWithBun } from "./run-with-bun.js";

const publishPackagesCommand = command({
  name: "publish-packages",
  description: "Publish packages to npm",
  args: {
    dryRun: flag({
      long: "dry-run",
    }),
  },
  handler: ({ dryRun }) => {
    const cmd = ["pnpm", "--recursive", "publish"];
    if (dryRun) {
      cmd.push("--dry-run");
    }
    const result = runCommandWithBun(cmd);
    if (result.exitCode !== 0) {
      console.error("Failed to publish packages");
      console.error(result.stderr);
      process.exit(1);
    }
    process.exit(0);
  },
});

const publishPackagesProgram = binary(publishPackagesCommand);
await run(publishPackagesProgram, process.argv);
