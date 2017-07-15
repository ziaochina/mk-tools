import fs from 'fs'
import path from 'path'
import vfs from 'vinyl-fs'
import through from 'through2'
import inquirer from 'inquirer'
import which from 'which'
import childProcess from 'child_process'

const { join, basename } = path

export default function index(appFolder = '') {

	if(appFolder){
		copy(appFolder, ()=> buildIndex(appFolder))
	}
	else{
		buildIndex(appFolder)
	}
}

function buildIndex(appFolder) {
		const basePath = process.cwd(),
		apps = []

	//获取文件数组
	const findApps = (absoultePath) => {
		var files = fs.readdirSync(absoultePath, () => {})
		files.forEach(filename => {
			var stats = fs.statSync(path.join(absoultePath, filename))
				//是文件
			if (stats.isFile()) {
				if (filename === 'index.js'){
					let content = fs.readFileSync(path.join(absoultePath, filename), 'utf-8')
					if(/load[ ]*:[ ]*\([ ]*cb[ ]*\)/.test(content)){
						console.log(path.join(absoultePath, filename))
						console.log( content.match( /name[ ]*:[ ]*\"([^\"]+)\"/))
						let appName = content.match( /name[ ]*:[ ]*\"([^\"]+)\"/)[1].replace(/[\/\.-]/g,'_')
						apps.push({name:appName, path:absoultePath})
					}
					
				}
			} else if (stats.isDirectory() && filename != 'node_modules') {
				findApps(path.join(absoultePath, filename))
			}
		})
	}

	findApps(basePath)

	/*
	import _src from '../index.app'
	import _src_apps_about from '../apps/about/index.app'
	import _src_apps_helloWorld from '../apps/helloWorld/index.app'
	*/
	var importAppsContent = apps.map(o => `import ${o.name} from './${path.relative(basePath,path.join(o.path,'index.js'))}'`).join('\r\n')

	/*
	const apps = {
		[_apps_demo.name]:_apps_demo,	
	}	
	*/
	var defineAppsContent = 'const apps = {\r\n'
	apps.map(o=>defineAppsContent+=`\t[${o.name}.name]:${o.name},\t\n`)
	defineAppsContent += '}\r\n'
	
	
	var regisiterMKComponentContent = `
import * as mkComponents from 'mk-component'

Object.keys(mkComponents).forEach(key=>{
	componentFactory.registerComponent(key, mkComponents[key])
})
	`

	var indexTemplate = fs.readFileSync(path.join(__dirname, '../../assets/index/index.template'), 'utf-8');
	var indexContent = indexTemplate
		.replace('${import-apps}', importAppsContent)
		.replace('${define-apps}', defineAppsContent)
		.replace('${regisiter-mk-component}', regisiterMKComponentContent)

	var indexFilePath = path.join(basePath, 'index.js')

	var existsIndex = fs.existsSync(indexFilePath)
	if (existsIndex) {
		fs.unlinkSync(indexFilePath)
	}
	fs.writeFileSync(indexFilePath, indexContent)

	var appLessContent = apps.map(
		o => `@import "./${path.relative(path.join(basePath,'assets','styles'),path.join(o.path, 'style.less'))}";`).join('\r\n')

	var appLessPath = path.join(basePath, 'assets','styles', 'apps.less')
	var existsAppLess = fs.existsSync(appLessPath)
	if (existsAppLess) {
		fs.unlinkSync(appLessPath)
	}

	fs.writeFileSync(appLessPath, appLessContent)

	console.log('OK!')
}


function copy(appFolder, cb) {
	var cwd = join(process.cwd(), appFolder)
	var appName = path.basename(cwd)
	if(fs.existsSync(path.join(cwd, 'index.js'))){
		var content = fs.readFileSync(path.join(cwd, 'index.js'), 'utf-8')
		appName =  content.match( /name[ ]*:[ ]*\"([^\"]+)\"/)[1].replace(/[\/\.]/g,'-') || appName
	}
	
	var dest = join(process.cwd(), 'src', 'apps', appName)

	vfs.src(['**/*', '!node_modules/**/*', "!" + process.cwd() + "/**/*"], {
		cwd: cwd,
		cwdbase: true,
		dot: true
	})
		.pipe(template(dest))
		.pipe(vfs.dest(dest))
		.on('end', function () {
			cb()
		})
		.resume();
}




function template(dest) {
	return through.obj(function (file, enc, cb) {
		if (!file.stat.isFile()) {
			return cb();
		}else{
			this.push(file);
			cb();
		}
	});
}
