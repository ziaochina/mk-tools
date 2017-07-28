import compileWebsite from './compileWebsite'
import compileServer from './compileServer'


export default function compile(who) {
	if( who == 'website')
		compileWebsite()

	if( who == 'server')
		compileServer()
}
