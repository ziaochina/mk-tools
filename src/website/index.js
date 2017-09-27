import vfs from 'vinyl-fs'
import fs from 'fs'
import through from 'through2'
import path from 'path'
import which from 'which'
import { findNpm, runCmd } from '../utils'

const { join, basename } = path

export default function website(cmd, options) {
	createWebsite(
		options.init ? (cmd || path.basename(process.cwd())) : cmd,
		options.init ? process.cwd() : join(process.cwd(), cmd)
	)
}

function createWebsite(websiteName, dest) {
	var cwd = join(__dirname, '../../assets/website/template')
	vfs.src(['**/*', '!node_modules/**/*'], { cwd: cwd, cwdbase: true, dot: true })

		.pipe(through.obj(function (file, enc, cb) {
			if (!file.stat.isFile()) {
				return cb()
			}
			this.push(file)
			cb()
		}))

		.pipe(vfs.dest(dest))

		.on('end', async () => {

			var replaceNameFiles = [
				path.join(dest, 'package.json'),
			]

			replaceNameFiles.forEach(o => {
				fs.writeFileSync(o, fs.readFileSync(o, 'utf-8').replace(/\$\{websiteName\}/g, websiteName))
			})

			var npm = findNpm()

			await runCmd(which.sync(npm), [
				'install',
				'react@15.6.1',
				'react-dom@15.6.1',
				'mk-meta-engine',
				'mk-component',
				'mk-utils',
				'moment',
				'--save'
			], dest)

			await runCmd(which.sync(npm), [
				'install',
				'babel-cli',
				'babel-core',
				'babel-loader',
				'babel-plugin-add-module-exports',
				'babel-plugin-transform-decorators-legacy',
				'babel-plugin-transform-runtime',
				'babel-preset-es2015',
				'babel-preset-react',
				'babel-preset-stage-0',
				'css-loader',
				'file-loader',
				'html-webpack-plugin',
				'less',
				'less-loader',
				'style-loader',
				'webpack',
				'webpack-dev-server',
				'cross-env',
				'--save-dev'
			], dest)

			console.log("OK!")

		}).resume()
}


