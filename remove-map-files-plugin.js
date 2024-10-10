// remove-map-files-plugin.js
class RemoveMapFilesPlugin {
  apply(compiler) {
    // 在 Webpack 的 after-emit 阶段删除 .map 文件
    compiler.hooks.emit.tapAsync('RemoveMapFilesPlugin', (compilation, callback) => {
      Object.keys(compilation.assets).forEach((asset) => {
        if (asset.endsWith('.map')) {
          // 删除 .map 文件
          delete compilation.assets[asset];
        }
      });
      callback();
    });
  }
}

module.exports = RemoveMapFilesPlugin;
