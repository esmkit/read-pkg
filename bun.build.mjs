await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "node", // default
  format: "esm",
  minify: false,
  external: [],
});
