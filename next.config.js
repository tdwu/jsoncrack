const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const RemoveMapFilesPlugin = require('./remove-map-files-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

/**
 * @type {import('next').NextConfig}
 */
const config = {
  assetPrefix: "/console/jsonView",
  basePath: "/console/jsonView",
  output: "export",
  reactStrictMode: false,
  // 关闭source map
  productionBrowserSourceMaps: false,
  compress:false,// 单独指定CompressionPlugin
  compiler: {
    styledComponents: true,
  },
  webpack: config => {
    config.resolve.fallback = { fs: false };
    config.output.webassemblyModuleFilename = "static/wasm/[modulehash].wasm";
    config.experiments = { asyncWebAssembly: true };

    config.devtool = false;
    // 使用自定义插件删除 .map 文件
    config.plugins.push(new RemoveMapFilesPlugin());
    
    // // 将 public 文件夹中的文件添加到 Webpack 处理的资源中
    // config.plugins.push(
    //   new CopyWebpackPlugin({
    //     patterns: [
    //       {
    //         from: path.resolve(__dirname, 'public'),  // 指定 public 文件夹路径
    //         to: path.resolve(__dirname, 'out/public'),  // 将 public 文件夹的内容复制到 out 文件夹
    //         globOptions: {
    //           ignore: ['**/*.gz'],  // 避免重复压缩 .gz 文件
    //         },
    //       },
    //     ],
    //   })
    // // );
    config.plugins.push(
      new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg|png|jpg)$/, // 只压缩 JS、CSS、HTML 和 SVG 文件
        threshold: 8192, // 只处理大于 8k 的文件
        minRatio: 0.8,  // 只有压缩比率小于 0.8 时才生成 gzip 文件  
      }));
    return config;
  },
};

const bundleAnalyzerConfig = withBundleAnalyzer(config);

const sentryConfig = withSentryConfig(
  config,
  {
    silent: true,
    org: "aykut-sarac",
    project: "json-crack",
  },
  {
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    disableServerWebpackPlugin: true,
  }
);

module.exports = process.env.ANALYZE === "true" ? bundleAnalyzerConfig : sentryConfig;
