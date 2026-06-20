import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    // 1. 共通のビルド出力先
    outDir: "dist",

    // 2. 複数のエントリーポイントを定義（出し分け）
    lib: {
      entry: {
        browser: resolve(__dirname, "src/browser.ts"),
        node: resolve(__dirname, "src/node.ts"),
      },
      // 出力するフォーマットを指定（ESモジュール と CommonJS）
      formats: ["es", "cjs"],
      // 拡張子を除いたファイル名のベース（[name] に browser や node が入る）
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },

    // 3. Rollup固有の細かい制御（ライブラリの除外設定）
    rollupOptions: {
      // Node.jsビルド時のみ node-hid を除外するための関数指定
      external: (id) => {
        // node-hid および Node.jsのビルトインモジュール（path, fs, child_processなど）を除外
        return id === "node-hid" || id.startsWith("node:");
      },
      output: {
        // CJSの時、デフォルトエクスポートと名前付きエクスポートの混在を安全に処理する設定
        exports: "named",
      },
    },
  },
});
