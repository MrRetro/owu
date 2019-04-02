# owu
owu 脚手架 初始化项目 基于vue

![](https://user-gold-cdn.xitu.io/2019/4/2/169dd3db01717ab6?w=640&h=400&f=gif&s=2845261)
### 技术点
- nodejs 
- commander模块(命令行参数处理模块) 
- co 模块(异步流程控制模块) 
- co-prompt 模块(消息提示模块) 
- chalk 模块（输出字体颜色模块） 
- github （远程托管仓库） 
- download-git-repo（获取github上项目） 
- ora（loading效果,各种小图标） 

### 新建文件夹owu，生成package.json文件

```cmd
npm init
```

### 安装以上提到的模块

```cmd
npm install co co-prompt chalk commander download-git-repo ora --save-dev
```

### 在package.json中配置bin

```js
"bin": {
    "owu": "bin/owu"
  }
```

### 编写入口文件bin/owu
``` js
#!/usr/bin/env node
let program = require('commander');
let package = require('../package.json');
let init = require('./init');
let list = require('./list')
program
    .version(package.version)
    .usage('<command> [options]');
program.command('init (template)')
    .description("创建新项目")
    .alias('i')
    .action(function(template){
         init(template);
    })
program.command('list')
    .description("显示可使用的模板列表")
    .alias('l')
    .action(function(){
       list();
    })
program.parse(process.argv);
if(program.args.length==0){
    //这里是处理默认没有输入参数或者命令的时候，显示help信息
    program.help();
}
```

#### 这个时候可以查看初始化效果
```cmd
node bin/owu
```

### 以上入口文件已写好,接着可以写list和init命令效果
bin/list.js
```js
let co = require('co');
let prompt = require('co-prompt');
let chalk = require('chalk');
let templates = require("../templates.js");
module.exports = function(){
    for(let key in templates.list){
        let temp = templates.list[key]
        console.log(
        '  ' + chalk.green('★') +
        '  ' + chalk.green(temp.name) +
        ' -' + temp.desc)
    };
    if(!templates.list||templates.list.length==0){
        console.log(chalk.yellow('当前无可用模板'))
    }
}
```

templates.js
```js
module.exports = {
    list:[
       {
        "name":"webpack",
        "path":"vuejs-templates/webpack",
        "desc":"A full-featured Webpack + vue-loader setup with hot reload, linting, testing & css extraction."
      },{
        "name":"webpack-simple",
        "path":"vuejs-templates/webpack-simple",
        "desc":"A simple Webpack + vue-loader setup for quick prototyping."
      },{
        "name":"webpack-multi",
        "path":"wang839305939/vue-cli-multi-page",
        "desc":"支持多页面编译的vue模板"
      }
    ]
}
```

### 查看模版效果
```cmd
node bin/owu list
```

bin/init.js

```js
let co = require('co');
let prompt = require('co-prompt');
let chalk = require('chalk');
let templates = require("../templates");
let download = require('download-git-repo');
let ora = require('ora');
let fs  = require('fs');
let utils = require('./utils');
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
        if(typeof tempName !== 'string') {
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
        let spanner = ora("   正在构建，客官请稍等......");
        spanner.start();
        if(fs.existsSync('download')){
            //刪除原文件
            utils.rmdirSync('download');
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
    utils.copyDirSync(__dirname+'/download',targetPath)
    console.log('    ','----------------------------------------')
    console.log('    ',chalk.green('★'),chalk.green('项目构建成功'));
    spanner.stop();
    process.exit(0);
}
```

bin/utils.js

```js
const fs = require('fs');

// 删除文件
function rmdirSync(path){
  let files = [];
  if(fs.existsSync(path)){
      files = fs.readdirSync(path);
      files.forEach((file, index) => {
          let curPath = path + "/" + file;
          if(fs.statSync(curPath).isDirectory()){
              rmdirSync(curPath); //递归删除文件夹
          } else {
              fs.unlinkSync(curPath); //删除文件
          }
      });
      fs.rmdirSync(path);
  }
}

// 复制文件
function copyDirSync(from,to){
  let files = [];
    if (fs.existsSync(to)) {           // 文件是否存在 如果不存在则创建
        files = fs.readdirSync(from);
        files.forEach(function (file, index) {
            var targetPath = from + "/" + file;
            var toPath = to + '/' + file;
            if (fs.statSync(targetPath).isDirectory()) { // 复制文件夹
              copyDirSync(targetPath, toPath);
            } else {                                    // 拷贝文件
                fs.copyFileSync(targetPath, toPath);
            }
        });
    } else {
        fs.mkdirSync(to);
        copyDirSync(from, to);
    }
}

module.exports = {
  rmdirSync,
  copyDirSync
}
```

### 初始化项目

```cmd
node bin/owu init webpack
```

### 将命令提升到全局

```cmd
npm link
```

### 最后可以试试这些命令

```cmd
owu #查看配置
```

```cmd
owu init #初始化项目
```

```cmd
owu init webpack #初始化项目，使用webpack模版
```

```cmd
owu list #查看模版列表
```

```cmd
owu --help #帮助
```