const { config,  start } = require("mk-server")
const myConfig = require( "./config")

const ss1 = require("./service/ss1/index.js")

const ss2 = require("./service/ss2/index.js")


const services = {
	[ss1.name]: ss1,	[ss2.name]: ss2,
}

services.config = function(options){ 
    Object.keys(this).filter(k => !!this[k].config).forEach(k=> { 
        let curCfg = Object.assign({}, options["*"], options[k])
        this[k].config(curCfg);  
    })
}

services.config({"*": {services}})

config(myConfig({services}))

start()