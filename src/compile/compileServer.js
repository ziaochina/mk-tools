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
		services = []

	//获取文件数组
	const findApps = (absoultePath) => {
		var files = fs.readdirSync(absoultePath, () => { })
		files.forEach(filename => {
			var stats = fs.statSync(path.join(absoultePath, filename))
			//是文件
			if (stats.isFile()) {
				if (filename === 'index.js') {
					let content = fs.readFileSync(path.join(absoultePath, filename), 'utf-8')
					if (/name[ ]*:[ ]*[\'\"]([^\"\']+)[\'\"]/.test(content) && /api/.test(content)) {
						let serviceName = content.match(/name[ ]*:[ ]*[\'\"]([^\"\']+)[\'\"]/)[1].replace(/[\/\.-]/g, '_')
						services.push({
							name: serviceName,
							path: absoultePath,
							relaPath: path.relative(basePath, path.join(absoultePath, 'index.js')).replace(/\\/g, "/")
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
		template(join(__dirname, '../../assets/server/index.template.js'), { services })
	)
}

function writeFile(path, content) {
	var exists = fs.existsSync(path)
	if (exists) {
		fs.unlinkSync(path)
	}
	fs.writeFileSync(path, content)
}

