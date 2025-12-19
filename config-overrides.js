const webpack = require("webpack");

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    "process/browser": require.resolve("process/browser"),
    vm: require.resolve("vm-browserify"),
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);

  // Replace react-scripts' hardcoded 'tailwindcss' with '@tailwindcss/postcss' for Tailwind v4
  const postcssLoaderRule = config.module.rules
    .find(rule => rule.oneOf)
    ?.oneOf?.find(rule => 
      rule.use?.some(loader => loader.loader?.includes('postcss-loader'))
    );

  if (postcssLoaderRule) {
    const postcssLoader = postcssLoaderRule.use.find(loader => 
      loader.loader?.includes('postcss-loader')
    );
    
    if (postcssLoader?.options?.postcssOptions?.plugins) {
      const plugins = postcssLoader.options.postcssOptions.plugins;
      const tailwindIndex = plugins.findIndex(p => p === 'tailwindcss');
      if (tailwindIndex !== -1) {
        plugins[tailwindIndex] = '@tailwindcss/postcss';
      }
    }
  }

  return config;
};
