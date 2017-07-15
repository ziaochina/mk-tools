import {Toast,Notification, Modal } from 'mk-component'

var _options

function config(options) {
	_options = options
	_options.targetDomId = 'app'
	_options.startAppName = '***' //mk-template-root
	//options.apps['mk-template-root'].config({defaultAppName:'app-demo'})

	_options.toast = Toast
	_options.notification = Notification
	_options.modal = Modal
	return _options
}

config.getCurrent = () => _options

export default config