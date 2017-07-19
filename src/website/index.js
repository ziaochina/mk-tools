import vfs from 'vinyl-fs'
import fs from 'fs'
import through from 'through2'
import path from 'path'
import inquirer from 'inquirer'
import which from 'which'
import childProcess from 'child_process'

const {
	join,
	basename
} = path

export default function website(cmd, options) {
	if(options.init){
		var websiteName = cmd || path.basename(process.cwd())
		createWebsite(websiteName, process.cwd())
	}else{
		createWebsite(cmd, join(process.cwd(), cmd))	
	}
	
}
function createWebsite(websiteName, dest) {
	var cwd = join(__dirname, '../../assets/website/websiteTemplate');
	vfs.src(['**/*', '!node_modules/**/*'], {
			cwd: cwd,
			cwdbase: true,
			dot: true
		})
		.pipe(template(dest))
		.pipe(vfs.dest(dest))
		.on('end', function() {
			var replaceNameFiles = [
				path.join(dest, 'package.json'),
			]

			replaceNameFiles.forEach(o => {
				fs.writeFileSync(o, fs.readFileSync(o, 'utf-8').replace(/\$\{websiteName\}/g, websiteName))
			})

			var npm = findNpm()

			runCmd(which.sync(npm), ['install', 'react', 'react-dom', 'mk-meta-engine', 'mk-component', 'mk-utils', 'moment', '--save'], function () {  
				runCmd(which.sync(npm), [
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
				'--save-dev'], function () {
					console.log("OK!");
				}, dest)
	
			}, dest)
			
		}).resume();
}


function template(dest) {
	return through.obj(function(file, enc, cb) {
		if (!file.stat.isFile()) {
			return cb();
		}
		this.push(file);
		cb();
	});
}

function simplifyFilename(filename) {
	return filename.replace(process.cwd(), ".");
}

function runCmd(cmd, args, fn, cwd) {
	args = args || []
	var runner = childProcess.spawn(cmd, args, {
		stdio: "inherit",
		cwd:cwd
	})
	runner.on('close', function(code) {
		if (fn) {
			fn(code)
		}
	})
}

var npms = ['npm']

function findNpm() {
	for (var i = 0; i < npms.length; i++) {
		try {
			which.sync(npms[i])
			console.log('use npm: ' + npms[i])
			return npms[i]
		} catch (e) {

		}
	}
	throw new Error('please install npm')
}