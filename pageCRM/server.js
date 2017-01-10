/**
 * Created by Administrator on 2017/1/2.
 */
//编写后台的逻辑处理
var http = require('http'),
    url = require('url'),
    fs = require('fs');
http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true);
    var pathname = urlObj.pathname,
        query = urlObj.query;
    //静态资源文件的处理
    var regFile = /\.([0-9a-zA-Z]+)/i;
    if (regFile.test(pathname)) {
        var suffix = regFile.exec(pathname)[1].toUpperCase(),
            suffixMIME = 'text/plain';
        switch (suffix) {
            case 'HTML':
                suffixMIME = 'text/html';
                break;
            case 'CSS':
                suffixMIME = 'text/css';
                break;
            case 'JS':
                suffixMIME = 'text/javascript';
                break;
        }
        var status = 404,
            conFile = "not found";
        try {
            conFile = fs.readFileSync('.' + pathname, 'utf-8');
            status = 200;
        } catch (e) {

        }
        res.writeHead(status, {'content-type': suffixMIME});
        res.end(conFile);
        return;
    }
    var data = JSON.parse(fs.readFileSync('./student.json'), 'uft-8');
    if (pathname === '/getList') {
        var n = query['n'];//告诉我是哪一个学生的信息
        //起始： (n-1)*10~ 结束：  n*10-1    获取索引号
        var ary = [];//存放我需要的内容
        for (var i = (n - 1) * 10; i < n * 10 - 1; i++) {
            //索引的最大值是98，之后就不再往下存储了
            // 通过规律计算的索引比最大的索引都要打的时候，直接跳出，说明他已经是最后一页了、
            if (i > data.length - 1) {
                break;
            }
            ary.push(data[i]);
        }
        res.writeHead(200, {'content-type': 'application/json'});
        res.end(JSON.stringify({
            code: 0,
            msg: "success",
            total: Math.ceil(data.length / 10),//页码是从1开始计算的
            data: ary
        }));
        return;
    }
    if (pathname === '/getInfo') {
        var result = {
            code: 1,
            msg: "学生不存在",
            obj: null
        };
        var studentId = query["id"],
            obj = {};
        //循环里面所有的数据
        for (var i = 0; i < data.length; i++) {
            if (data[i]['id'] == studentId) {
                obj = data[i];
                break;
            }
        }
        if (obj) {
            result = {
                code: 0,
                msg: "成功",
                data: obj
            }
        }

        res.writeHead(200, {'content-type': 'application/json'});
        res.end(JSON.stringify(result));
        return;
    }
    //如果请求的接口不存在
    res.writeHead(404);
    res.end("请求的API接口地址不存在");

}).listen(81, function () {
    console.log("监听服务器端口号81成功！");
});