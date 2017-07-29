const { config, start } = require("mk-server")
const myConfig = require( "./config")
{{each services}}
const {{$value.name}} = require("./{{$value.relaPath}}")
{{/each}}

const services = {
{{each services}}	
    [{{$value.name}}.name]: {{$value.name}},
{{/each}}
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