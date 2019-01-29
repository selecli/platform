var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  api_url: '"http://172.30.107.61:8080"',
//  api_url: '"http://172.30.105.205:8080"',
//  api_url: '"http://172.23.5.171:8080"',
//  api_url: '"http://satp.tendcloud.com/api/"',
  home: '"http://localhost:8089"',
})
