const path = require("path");

module.exports = {
  // mode: "production",
  mode: "production",
  entry: "./main/web.js", // 入力ファイル
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "web.js", // 出力される単一ファイル名
    library: {
      name: "kLib", // ブラウザで <script> 読み込みした時のグローバル変数名
      type: "umd", // UMD形式（CommonJS, AMD, ブラウザ等、どこでも動く形式）
    },
    globalObject: "this", // Node.jsとブラウザ両対応のため
  },
};
