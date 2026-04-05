const path = require("path");
const webpack = require("webpack");

/**
 * @param {"web"|"node"} webOrNode
 */
const genConfig = (webOrNode) => ({
  mode: "production",
  target: `${webOrNode}`,
  entry: `./main/${webOrNode}.js`,
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: `korockle.${webOrNode}.js`,
    library: {
      name: "kLib",
      type: "umd",
    },
    globalObject: "this",
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `Mameeenn Korockle Library | MIT License \nhttps://github.com/manmen2414/MameKorockleLib`,
    }),
  ],
});

const webConfig = {
  ...genConfig("web"),
  externals: ["midi-parser-js", "fast-xml-parser"],
};

const nodeConfig = genConfig("node");

module.exports = [webConfig, nodeConfig];
