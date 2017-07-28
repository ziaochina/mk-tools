/**
 * server配置
 * 
 */

function config(options) { 
	Object.assign(_options, options) 
	return _options
} 

var _options = config.current = {
    host: '0.0.0.0',  
    port: 8000, 
    apiRootUrl: '/v1'
} 

module.exports = config
