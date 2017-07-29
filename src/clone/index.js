import fs from 'fs'
import path from 'path'
import vfs from 'vinyl-fs'
import through from 'through2'
import which from 'which'
import { findNpm, runCmd, trim } from '../utils'

const { join, basename } = path

export default async function cloneApp(appName, targetPath) {
    targetPath = trim(targetPath)

    var npm = findNpm()
    var apps = appName.split(',')
    await runCmd(which.sync(npm), ['install', ...apps, '--save'], process.cwd())

    apps.forEach(o => {
        let p = targetPath
        if (targetPath.substr(targetPath.length - 1, 1) == '/') {
            p = targetPath + o
        }
        cp(o, p)
    })

    await runCmd(which.sync(npm), ['uninstall', ...apps], process.cwd())
}


function cp(appName, targetPath) {
    var cwd = join(process.cwd(), 'node_modules', appName)
    var dest = join(process.cwd(), targetPath)

    vfs.src(['**/*', '!node_modules/**/*', '!*.md', '!*.npmignore', '!LICENSE', '!*.gitignore', '!package.json'],
        { cwd: cwd, cwdbase: true, dot: true })

        .pipe(through.obj(function (file, enc, cb) {
            if (!file.stat.isFile()) {
                return cb();
            }
            this.push(file);
            cb();
        }))

        .pipe(vfs.dest(dest))

        .on('end', function () {
        })
        .resume();
}
