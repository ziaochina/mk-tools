import vfs from 'vinyl-fs'
import fs from 'fs'
import through from 'through2'
import path from 'path'
import inquirer from 'inquirer'
import which from 'which'
import childProcess from 'child_process'

const { join, basename } = path

export default function app(cmd, options) {
	if(options.init){
		var appName = cmd || path.basename(process.cwd())
		createApp(appName,process.cwd())
	}else{
		createApp(cmd, join(process.cwd(), cmd))	
	}
}


function createApp(appName, dest){
	var cwd = join(__dirname, '../../assets/app/appTemplate')
	vfs.src(['**/*', '!node_modules/**/*'], {
			cwd: cwd,
			cwdbase: true,
			dot: true
		})
		.pipe(template(dest))
		.pipe(vfs.dest(dest))
		.on('end', function() {
			var replaceNameFiles = [
				path.join(dest, 'index.js'),
				path.join(dest, 'style.less'),
			]

			replaceNameFiles.forEach(o => {
				fs.writeFileSync(o, fs.readFileSync(o, 'utf-8').replace(/\$\{appName\}/g, appName))
			})

			console.log('OK!')
				
		})
		.resume();
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

function runCmd(cmd, args, fn) {
  args = args || []
  var runner = childProcess.spawn(cmd, args, {
    stdio: "inherit"
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