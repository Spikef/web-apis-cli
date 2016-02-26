# Web APIs

基于node/express的API测试框架.

A simple web api test framework based on node/express.

快速使用:

    npm install web-apis-cli -g

    wa init test

    cd test

    wa start

    打开浏览器,在地址栏里面ctrl+V/⌘+V(初始管理员账号`admin`,密码`admin888`)

## Install

`npm install web-apis-cli -g`

## Command

### 创建一个网站

`wa init <name> [title] [port]`

name: 网站目录名称

title: 网页标题

port: 接口, 如果需要创建多个接口测试服务, 请指定不同的IP地址以访问

### 启动网站

`wa start`

### 升级网站

`wa update`

### 修改端口

`wa port <port>`

port: 同上

### 修改标题

`wa title <title>`

title: 同上

### 操作管理员

`wa admin <action> [username] [password] [userRank]`

action: add(添加管理员)、modify(修改管理员)、remove(删除管理员)、login(检验登录)、check(检验UserKey和UserToken)

username: 用户名或者UserKey

password: 密码或者UserToken

userRank: 用户等级

    1 顶级管理员(可以添加、删除或者修改任意管理员)

    2 超级管理员(可以添加、删除或者修改3级管理员和进行所有的接口操作)

    3 普通管理员(可以添加或者修改接口操作)