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

export default function server(cmd, options) {
    if (options.init) {
        var serverName = cmd || path.basename(process.cwd())
        createServer(serverName, process.cwd())
    } else {
        createServer(cmd, join(process.cwd(), cmd))
    }
}

function createServer(serverName, dest) {
    var cwd = join(__dirname, '../../assets/server/serverTemplate');
    vfs.src(['**/*', '!node_modules/**/*'], {
        cwd: cwd,
        cwdbase: true,
        dot: true
    })
        .pipe(template(dest))
        .pipe(vfs.dest(dest))
        .on('end', function () {
            var replaceNameFiles = [
                path.join(dest, 'package.json'),
            ]

            replaceNameFiles.forEach(o => {
                fs.writeFileSync(o, fs.readFileSync(o, 'utf-8').replace(/\$\{serverName\}/g, serverName))
            })

            var npm = findNpm()

            runCmd(which.sync(npm), ['install', 'mk-server', '--save'], function () {}, dest)

        }).resume();
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
        cwd: cwd
    })
    runner.on('close', function (code) {
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