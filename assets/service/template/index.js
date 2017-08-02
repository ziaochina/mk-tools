/*
 *  index.js        //属性说明，导出的config方法在服务器启动时调用，api对象的下级方法绑定到对应的url，如: api.create 方法绑定的url是 "/${name}/create"
*/
const api = require("./api")

const index = {
    name: "${serviceName}",
    version: "",
    description: "",
    author: "",
    config,
    api,
}

module.exports = index;



 
/*
 *  config.js        //初始化参数设置
*/

function config(options) {
    var current = config.current
    Object.assign(current, options)
    api._init(current)
} 
config.current = {}
