import fs from 'fs'
import path from 'path'
import vfs from 'vinyl-fs'
import through from 'through2'
import which from 'which'
import { findNpm, runCmd, trim } from '../utils'

const { join, basename } = path

export default async function cloneApp(appName, targetPath) {
    targetPath = trim(targetPath)
    if( targetPath.substr(targetPath.length - 1, 1) == '/' ){
        targetPath = targetPath + appName
    }

    var npm = findNpm()
    await runCmd(which.sync(npm), ['install', appName, '--save'], process.cwd())

    cp(appName, targetPath)

    await runCmd(which.sync(npm), ['uninstall', appName], process.cwd())
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
