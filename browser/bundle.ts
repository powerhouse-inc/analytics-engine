await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./build",
  target: "browser",
  sourcemap: true,
});
