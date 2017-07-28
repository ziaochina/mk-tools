import config from './config'
import * as data from './data'

export default {
	name: "${appName}",
	version: "1.0.0",
	description: "${appName}",
	meta: data.getMeta(),
	components: [],
	config: config,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'))
		}, "${appName}")
	}
}