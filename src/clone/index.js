import fs from 'fs'
import path from 'path'
import vfs from 'vinyl-fs'
import through from 'through2'
import inquirer from 'inquirer'
import which from 'which'
import childProcess from 'child_process'

const { join, basename } = path

export default function install(appName, targetFolderName) {
	npmInstall(appName, targetFolderName)
}

function npmInstall(appName, targetFolderName){
	var npm = findNpm()

	runCmd(which.sync(npm), ['install', appName, '--save'], function(){

		cpToMK(appName, targetFolderName)
		
		runCmd(which.sync(npm), ['update'], function(){
			runCmd(which.sync(npm), ['uninstall', appName], function(){
				console.log('OK!')
			}, process.cwd())
		},process.cwd())

		
	},process.cwd())
}

function cpToMK(appName, targetFolderName){
	var cwd = join(process.cwd(), 'node_modules', appName)
	var dest = join(process.cwd(), 'apps', targetFolderName)

	vfs.src(['**/*', '!node_modules/**/*'], {
		cwd: cwd,
		cwdbase: true,
		dot: true
	})
		.pipe(template(dest))
		.pipe(vfs.dest(dest))
		.on('end', function () {
		})
		.resume();
}

function template(dest) {
	return through.obj(function (file, enc, cb) {
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
	runner.on('close', function (code) {
		if (fn) {
			fn(code)
		}
	})
}

var npms = ['tnpm', 'cnpm', 'npm']

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
