import fs from 'fs'
import path from 'path'
import * as utils from '../utils'
import apidoc from 'apidoc-core'
import beautify from 'mk-utils/lib/beautify'

export default function gen() {
  
  var logger = {
    debug: function () {
      //console.log(arguments); 
    },
    verbose: function () {
      //console.log(arguments); 
    },
    info: function () {
      //console.log(arguments);
    },
    warn: function () {
      console.log(arguments);
    },
    error: function () {
      console.log(arguments);
    }
  }

  apidoc.setLogger(logger)

  var json = apidoc.parse({
    src: './',
    includeFilters: [".*\.js$"],
    excludeFilters: [".*node_modules.*"]
  })

  const apiDoc = JSON.stringify((new Function("return " + json.data))())
  if(apiDoc)
     utils.writeFile('./apiDoc.js', beautify.beautifyJS('module.exports = ' + apiDoc))
  else
     utils.writeFile('./apiDoc.js', beautify.beautifyJS('module.exports = []'))
}

