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

  // Update PostCSS loader to use @tailwindcss/postcss instead of tailwindcss
  const postcssLoader = config.module.rules.find(
    rule => rule.oneOf
  )?.oneOf?.find(
    rule => rule.use && rule.use.find(loader => 
      loader.loader && loader.loader.includes('postcss-loader')
    )
  );

  if (postcssLoader) {
    const postcssLoaderConfig = postcssLoader.use.find(loader => 
      loader.loader && loader.loader.includes('postcss-loader')
    );
    
    if (postcssLoaderConfig && postcssLoaderConfig.options && postcssLoaderConfig.options.postcssOptions) {
      const plugins = postcssLoaderConfig.options.postcssOptions.plugins;
      if (Array.isArray(plugins)) {
        const tailwindIndex = plugins.findIndex(plugin => 
          plugin === 'tailwindcss' || 
          (typeof plugin === 'string' && plugin.includes('tailwindcss'))
        );
        if (tailwindIndex !== -1) {
          plugins[tailwindIndex] = '@tailwindcss/postcss';
        }
      } else if (typeof plugins === 'function') {
        // If plugins is a function, wrap it
        const originalPlugins = plugins;
        postcssLoaderConfig.options.postcssOptions.plugins = (loader) => {
          const pluginList = originalPlugins(loader);
          const tailwindIndex = pluginList.findIndex(plugin => 
            plugin === 'tailwindcss' || 
            (typeof plugin === 'string' && plugin.includes('tailwindcss'))
          );
          if (tailwindIndex !== -1) {
            pluginList[tailwindIndex] = require('@tailwindcss/postcss');
          }
          return pluginList;
        };
      }
    }
  }

  return config;
};
