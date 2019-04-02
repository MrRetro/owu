let co = require('co');
let prompt = require('co-prompt');
let chalk = require('chalk');
let templates = require("../templates");
let download = require('download-git-repo');
let ora = require('ora');
let fs  = require('fs');
let util  = require('./download/utils/index.js')
let temps = {};
let temps2 = {};
module.exports = function(name) {
    getTemps(templates);
    co(generator(name));
}

function getTemps(templates) {
    for(let key in templates.list) {
        let item = templates.list[key]
        temps[key] = item.name;
        temps2[item.name] = item.path;
    };
}

let generator = function *(name) {
        let tempName  = name;
        let path = temps2[name];
        if(!name) {
           console.log('    可用模板列表:')
           for(let key in temps) {
                let tempName = temps[key]
                console.log(
                    '     ' + chalk.green(key) +
                    ' : ' + chalk.green(tempName))
                };
               tempName = yield prompt("    请选择模板类型:")
               path = temps2[temps[tempName]];
        }
        if(temps[tempName] || temps2[tempName]) {
                console.log('    ----------------------------------------')
                let projectName = yield prompt("    请输入项目名称(demo):")
                if(!projectName) {
                    projectName = "demo"
                }
                console.log('    ----------------------------------------')
                downloadTemplates(path,projectName);

        } else {
                console.log(chalk.red(`   ✘模版[${tempName}]不存在`))
                process.exit(0);
        }
    }

function downloadTemplates(path,projectName) {
        let spanner = ora("   正在构建，客官請稍等......");
        spanner.start();
        if(fs.existsSync('download')){
            //刪除原文件
            util.rmdirSync('download');
        }
        download(path,__dirname+'/download', function(err) {            
                if(err) {
                    spanner.stop();
                    console.log('    ','----------------------------------------')
                    console.log('    ',chalk('x构建失败'), err);
                    process.exit(0);
                }
                startBuildProject(spanner,projectName)
        })

    }

function startBuildProject(spanner,projectName){
    let targetPath = process.cwd()+"/"+projectName
    util.copyDirSync(__dirname+'/download',targetPath)
    console.log('    ','----------------------------------------')
    console.log('    ',chalk.green('★'),chalk.green('项目构建成功'));
    spanner.stop();
    process.exit(0);
}