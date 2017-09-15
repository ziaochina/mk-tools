import compileWebsite from './compileWebsite'
import compileServer from './compileServer'
import genDoc from './genDoc'
import path from 'path'
import apidoc from 'apidoc-core'


export default function compile(who, options) {
	if( who == 'website')
		compileWebsite()

	if( who == 'server')
		compileServer()

	if(options.apidoc === true)
		genDoc()

	console.log('OK!')
}
