import vfs from 'vinyl-fs'
import fs from 'fs'
import through from 'through2'
import path from 'path'
import which from 'which'
import { findNpm, runCmd } from '../utils'


const { join, basename } = path

export default function app(cmd, options) {

    createApp(
        options.init ? (cmd || path.basename(process.cwd())) : cmd,
        options.init ? process.cwd() : join(process.cwd(), cmd)
    )

    function createApp(appName, dest) {
        var cwd = join(__dirname, '../../assets/app/template')
        vfs.src(['**/*', '!node_modules/**/*'], { cwd: cwd, cwdbase: true, dot: true })

            .pipe(through.obj(function (file, enc, cb) {
                if (!file.stat.isFile()) {
                    return cb()
                }
                this.push(file)
                cb()
            }))

            .pipe(vfs.dest(dest))

            .on('end', async function () {
                var replaceNameFiles = [
                    path.join(dest, 'index.js'),
                    path.join(dest, 'index.umd.js'),
                    path.join(dest, 'style.less'),
                    path.join(dest, 'package.json'),
                    path.join(dest, 'webpack.config.js'),
                ]

                replaceNameFiles.forEach(o => {
                    fs.writeFileSync(o, fs.readFileSync(o, 'utf-8').replace(/\$\{appName\}/g, appName.split('/').pop()))
                })

                var npm = findNpm()

                await runCmd(which.sync(npm), [
                    'install',
                    'immutable',
                    'react',
                    'react-dom',
                    '--save'
                ], dest)

                await runCmd(which.sync(npm), [
                    'install',
                    "babel-cli",
                    "babel-core",
                    "babel-loader",
                    "babel-plugin-add-module-exports",
                    "babel-plugin-transform-decorators-legacy",
                    "babel-plugin-transform-runtime",
                    "babel-preset-es2015",
                    "babel-preset-react",
                    "babel-preset-stage-0",
                    "cross-env",
                    "css-loader",
                    "extract-text-webpack-plugin",
                    "file-loader",
                    "less",
                    "less-loader",
                    "style-loader",
                    "url-loader",
                    "webpack",
                    "webpack-dev-server",
                    '--save-dev'
                ], dest)


                console.log('OK!')

            })
            .resume();
    }
}
