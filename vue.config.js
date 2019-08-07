var path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  chainWebpack:  config => {
    // ie报错无效字符 添加该配置项 解决该问题
    config.module
      .rule('iview')
      .test(/iview.src.*?js$/)
      .use('babel')
        .loader('babel-loader')
        .end()
  },
  
  configureWebpack: config => {
    //入口文件
    config.entry.app = ['babel-polyfill', './src/main.ts'];
    config.resolve = {
      extensions: ['.js', '.vue', '.json', ".css", ".less", '.ts'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': resolve('src'),
        'components': resolve('src/components'),
        'common': resolve('src/common'),
        'assets': resolve('src/assets'),
        'config': resolve('src/config'),
        'views': resolve('src/views'),
        'utils': resolve('src/utils')
      }
    }
  },
  outputDir: 'iot',
  assetsDir: 'iot-static',
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://localhost:36667/api/',
        // target: 'http://10.8.2.33:8000/api/', // 孝俊
        // target: 'http://10.8.2.23:8000/api/', // 王衡
        // target: 'http://10.8.2.17:8000/api/', // 家顺
        target: 'http://10.74.20.25:8000/api/', // 测试服务器
        // target: 'http://10.8.4.192:8000/api/',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        },
      },
      'ws': {
        target: 'http://10.8.2.23:8000/', // 王衡
        ws: true,
        secure: true,
        pathRewrite: {
          '^/ws': ''
        }
      },
    }
  },
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },

  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        path.resolve(__dirname, './src/style/index.less')
      ]
    }
  }
}
