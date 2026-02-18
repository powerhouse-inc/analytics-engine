export function runCommandWithBun(
  cmd: string[],
  env?: Record<string, string | undefined>,
) {
  return Bun.spawnSync({
    cmd,
    stdio: ["inherit", "inherit", "inherit"],
    env: {
      ...process.env,
      ...env,
    },
  });
}
