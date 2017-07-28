import vfs from 'vinyl-fs'
import fs from 'fs'
import through from 'through2'
import path from 'path'
import which from 'which'

import { findNpm, runCmd } from '../utils'

const { join, basename } = path

export default function server(cmd, options) {
    createServer(
		options.init ? (cmd || path.basename(process.cwd())) : cmd,
		options.init ? process.cwd() : join(process.cwd(), cmd)
    )
}

function createServer(serverName, dest) {
    var cwd = join(__dirname, '../../assets/server/template')
    vfs.src(['**/*', '!node_modules/**/*'], {cwd: cwd,cwdbase: true,dot: true})
        
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
                fs.writeFileSync(o, fs.readFileSync(o, 'utf-8').replace(/\$\{serverName\}/g, serverName))
            })

            var npm = findNpm()

            await runCmd(which.sync(npm), ['install', 'mk-server', '--save'], dest)

            console.log("OK!")

        }).resume();
}

