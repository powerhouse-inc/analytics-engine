export function runCommandWithBun(
  cmd: string[],
  env?: Record<string, string | undefined>,
) {
  return Bun.spawnSync({
    cmd,
    env: {
      ...process.env,
      ...env,
    },
  });
}
