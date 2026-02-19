await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./build",
  target: "node",
  sourcemap: true,
});
