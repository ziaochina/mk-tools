import fs from 'fs'
import path from 'path'
import vfs from 'vinyl-fs'
import through from 'through2'
import template from 'art-template'

const { join, basename } = path

export default function compile() {
	internal()
}

function internal() {
	const basePath = process.cwd(),
		apps = []

	//获取文件数组
	const findApps = (absoultePath) => {
		var files = fs.readdirSync(absoultePath, () => { })
		files.forEach(filename => {
			var stats = fs.statSync(path.join(absoultePath, filename))
			//是文件
			if (stats.isFile()) {
				if (filename === 'index.js') {
					let content = fs.readFileSync(path.join(absoultePath, filename), 'utf-8')
					if (/load[ ]*:[ ]*\([ ]*cb[ ]*\)/.test(content) && /name[ ]*:[ ]*[\'\"]([^\"\']+)[\'\"]/.test(content)) {
						let appName = content.match(/name[ ]*:[ ]*[\'\"]([^\"\']+)[\'\"]/)[1].replace(/[\/\.-]/g, '_')
						apps.push({
							name: appName,
							path: absoultePath,
							relaIndexPath: path.relative(basePath, path.join(absoultePath, 'index.js')).replace(/\\/g, "/"),
							existsIndex: fs.existsSync(path.join(absoultePath, 'index.js')),
							relaLessPath: path.relative(path.join(basePath, 'assets', 'styles'), path.join(absoultePath, 'style.less')).replace(/\\/g, "/"),
							existsLess: fs.existsSync(path.join(absoultePath, 'style.less')),
							relaMockPath: path.relative(basePath, path.join(absoultePath, 'mock.js')).replace(/\\/g, "/"),
							existsMock: fs.existsSync(path.join(absoultePath, 'mock.js')),
						})
					}

				}
			} else if (stats.isDirectory() && filename != 'node_modules') {
				findApps(path.join(absoultePath, filename))
			}
		})
	}

	findApps(basePath)

	writeFile(
		path.join(basePath, 'index.js'),
		template(join(__dirname, '../../assets/website/index.template.js'), { apps })
	)

	writeFile(
		path.join(basePath, 'assets', 'styles', 'apps.less'),
		template(join(__dirname, '../../assets/website/apps.template.less'), { apps })
	)

	writeFile(
		path.join(basePath, 'mock.js'),
		template(join(__dirname, '../../assets/website/mock.template.js'), { apps })
	)
}

function writeFile(path, content) {
	var exists = fs.existsSync(path)
	if (exists) {
		fs.unlinkSync(path)
	}
	fs.writeFileSync(path, content)
}

