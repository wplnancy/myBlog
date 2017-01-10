var http = require("http");
var url = require("url");
var fs = require("fs");

var server1 = http.createServer(function (request, response) {
    var urlObj = url.parse(request.url, true),
        pathname = urlObj.pathname,
        query = urlObj.query;
    var reg = /\.([0-9a-zA-Z]+)/i;
    if (reg.test(pathname)) {
        var suffix = reg.exec(pathname)[1].toUpperCase(),
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
        try {
            response.writeHead(200, {'content-type': suffixMIME});
            var conFile = fs.readFileSync('.' + pathname, 'utf-8');
            response.end(conFile);

        } catch (e) {
            response.writeHead(404, {'content-type': 'text/plain;charset=utf-8'});
            response.end("file is not found!");

        }
        return;//如果是请求的是资源文件的话，后面的就没有必要再执行了
    }
    //->  API数据接口的处理
    var con = null;
    var customPath = "./json/custom.json";
    //将con里面的内容获取到
    con = fs.readFileSync(customPath, "utf-8");
    //如果是空数组的话是可以转换为json的数据格式
    // 如果是文件里面什么都没有的话，读取到的就是空字符串，就会报错
    con.length === 0 ? con = '[]' : null;//为了防止custom中什么都没有，con='',JSON.parse转换的时候会报错。
    con = JSON.parse(con);
    if (pathname === '/getList') {
        var result = null;
        //获取所有用户的信息
        //开始按照api文档中的规范准备给客户端返回数据
        result = {
            code: 1,
            msg: "没有任何客户信息",
            data: null
        };
        //当有数据的时候
        if (con.length > 0) {
            result = {
                code: 0,
                msg: "成功",
                data: con
            };
        }
        // 返回给客户端的信息应该都是字符串的格式
        response.writeHead(200, {'content-type': 'application/json;charset:utf-8'});

        //json格式的对象转换为字符串的形式返回给客户端
        response.end(JSON.stringify(result));
        return;
    }


    //2)  根据传递进来的客户的ID获取某一个具体的客户信息
    // query存储的是客户端请求的是url地址中问号传参后面的信息，并且是以对象的键值对的方式存储的

    if (pathname === '/getInfo') {
        var customId = query["id"];//获取？号传参之后的值
        //首先准备的是一个不成功的对象
        result = {
            code: 1,
            msg: "客户不存在",
            data: null
        };

        for (var i = 0; i < con.length; i++) {
            if (con[i]["id"] == customId) {
                //con[i]就是你想要的对象
                result = {
                    code: 0,
                    msg: "成功",
                    data: con[i]//获取对应id对应的数据
                };
            }
        }
        response.writeHead(200, {'content-type': 'application/json;charset:utf-8'});
        //注意这里返回的数据一定要是字符串类型的格式
        response.end(JSON.stringify(result));
        return;
    }

    //根据传递进来的客户的id删除这个用户
    if (pathname === "/removeInfo") {
        customId = query["id"];
        var flag = false;
        result = {
            code: 1,
            msg: "删除失败"
        };
        for (var i = 0; i < con.length; i++) {
            //customId  获取到的是字符串的形式，所以这里不能使用严格相等的形式
            if (con[i]["id"] == customId) {
                //删除con[i]这一项
                con.splice(i, 1);//仅仅是删除了得到的数组的那一项，但是文件里面的内容是没有删除成功的，这个时候就需要重新写入
                flag = true;
                break;
            }
        }
        if (flag) {
            fs.writeFileSync(customPath, JSON.stringify(con), "utf-8");//写入文件
            //告诉客户端你的操作是成功还是失败的
            result = {
                code: 0,
                msg: "删除成功"
            }
        }
        response.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
        response.end(JSON.stringify(result));
        return;
    }

    //4)增加用户的信息  post 请求

    if (pathname === "/addInfo") {
        //如何从请求主体中传递进来  query只对问号传参有作用

        //request提供了两个时间on
        var str = '';
        request.on("data", function (chunk) {
            //data是服务器正在一点点的接受服务端传进来的信息
            //回调函数是我接受一点我就执行一点
            str += chunk;
        });
        request.on("end", function () {
            // end事件是表示一点点来接收客户端发送的内容
            // str就是我们想要的结果  str=‘{“name”:"","age":....}’

            // on就是事件绑定，所有的事件绑定都是异步的
            // 我准备一条数据放进custom里面去
            response.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
            if (str.length === 0) {
                //什么都没有传递的话
                response.end(JSON.stringify({
                    code: 1,
                    msg: "增加失败，没有传递任何增加的信息！"
                }));

                return;
            }

            //如果传递了的话
            var data = JSON.parse(str);
            //在现有的data中追加一个id就可以了，获取con最后一项中的id,心的id增加1就可以了
            data["id"] = con.length === 0 ? 1 : parseFloat(con[con.length - 1]["id"]) + 1;


            con.push(data);
            //con重新写入
            fs.writeFileSync(customPath, JSON.stringify(con), "utf-8");

            response.end(JSON.stringify({
                code: 0,
                msg: "增加成功！"
            }));
        });

        // console.log(res);//这里会提前执行，获取到的是空字符串，所以所有的操作都要在事件里面完成才可以
        return;

    }

    //修改客户信息
    if (pathname === '/updateInfo') {
        str = '';
        request.on("data", function (chunk) {
            str += chunk;
        });
        request.on('end', function () {
            if (str.length === 0) {
                //什么都没有传递的话
                response.writeHead(200, {'content-type': 'application/json;charset=utf-8'});
                response.end(JSON.stringify({
                    code: 1,
                    msg: "修改信息，没有传递任何增加的信息！"
                }));
                return;
            }
            var flag = false;//存储有没有修改
            var data = JSON.parse(str);
            for (var i = 0; i < con.length; i++) {
                if (con[i]["id"] == data["id"]) {
                    con[i] = data;
                    flag = true;
                    break;
                }

            }
            result = {
                code: 1,
                msg: "修改信息不成功"
            };
            if (flag) {
                fs.writeFileSync(customPath, JSON.stringify(con), "utf-8");
                result = {
                    code: 0,
                    msg: "修改成功"
                }
            }
            response.end(JSON.stringify(result));


        });
        return;
    }

    //如果请求的地址不是上述任何一个的话，则提示不存在即可
    response.writeHead(404, {'content-type': 'text/plain;charset=utf-8'});
    response.end("请求的数据接口不存在");
});
server1.listen(81, function () {
    console.log("server is success ,listening on 81 port");
});




