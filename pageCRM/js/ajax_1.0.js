/**
 * Created by Administrator on 2016/12/31.
 */
function createXHR() {
    var xhr = null;
    var ary = [
        function () {
            return new XMLHttpRequest();
        },
        function () {
            return new ActiveXObject("Microsoft.XMLHTTP");
        },
        function () {
            return new ActiveXObject("Msxm12.XMLHTTP");
        },
        function () {
            return new ActiveXObject("Msxm13.XMLHTTP");
        }
    ];
    for (var i = 0; i < ary.length; i++) {
        var curObj = ary[i];
        try {
            xhr = curObj();
            flag = true;
            createXHR = curObj;
        } catch (e) {

        }
    }
    if (!flag) {
        throw new Error("你的浏览器不支持ajax");
    }
    return xhr;
}

//一个一个的定义形参的话，不能出现不能传递参数的，只要有一个不传递的，后面的都要往前错一位
//顺序有严格的限制
//以后升级加参数很多东西都要再去处理
/**
 * initDefaultParameter  初始化默认参数信息  用最新传递进来的值覆盖原有的默认值
 */
function initDefaultParameter(newOptions, defaultOption) {
    for (var key in newOptions) {
        if (newOptions.hasOwnProperty(key)) {
            defaultOption[key] = newOptions[key];//把修改之后的进行替换
        }
    }
    return defaultOption;//把替换完之后的对象返回
}

function ajax(options) {
    // init parameter
    options = initDefaultParameter(options, {
        url: null,
        type: 'get',
        dataType: 'text',
        data: null,
        async: true,
        cache: true,
        success: null,//后面的三个都是回调函数
        error: null,
        header: null//响应头已经接收  这个函数在jq中是不存在的，只是为了更加的方便获取响应头的信息
    });
    var xhr = new createXHR();
    //处理data
    // 1、判断之前的url中是否存在问号,从而判断连在url末尾连接的符号
    // 2、处理get请求和post请求的区别

    var isMark = options.url.indexOf('?') >= 0 ? true : false;
    var mark = isMark ? '&' : '?';//设置连接符
    var reg = /^(get|delete|head)$/i;//get系列的


    if (options.data) {
        if (reg.test(options.type)) {
            options.data = formatData(options.data);
            options.url += mark + options.data;
            options.data = null;
        } else {
            //变成json格式的对象
            options.data = JSON.stringify(options.data);//这个方法不兼容实现兼容性的处理  ie6-7不兼容   思考题
        }
    }
    //处理缓存问题
    if (reg.test(options.type) && options.cache === false) {
        isMark = options.url.indexOf('?') >= 0 ? true : false;
        mark = isMark ? '&' : '?';
        options.url += mark + '_=' + Math.random();
    }


    //一般是使用小写的
    xhr.open(options.type.toLowerCase(), options.url, options.async);
    //处理get系列的缓存的问题
    xhr.onreadystatechange = function () {
        if (xhr.status !== 200) return;
        if (/^(?:2|3)\d{2}$/.test(xhr.status)) {
            if (xhr.readyState === 2) {
                var time = new Date(xhr.getResponseHeader('Date'));
                if (typeof  options.header === "function") {
                    options.header.call(xhr, time);
                }
            }
            if (xhr.readyState === 4) {
                //  通过responseText从服务器端获取的数据都是字符串格式的，而且服务器一般给我们客户端返回的格式都是字符串的格式的，而我们预设的dataType其实就是为了把从服务器获取的字符串转换为有助于开发的json格式的对象或者是xml格式的对象
                var val = xhr.responseText;
                //这样写需要保证使用者要么不传，传递的话一定要是一个回调函数

                options.dataType = options.dataType.toUpperCase();

                //jq中的实现思想一致
                switch (options.dataType) {
                    case 'JSON':
                        val = 'JSON' in window ? JSON.parse(val) : eval('(' + val + ')');
                        break;
                    case 'XML':
                        val = xhr.responseXML;
                        break;
                }
                options.success && options.success.call(xhr, val);//逻辑&判断
                return;
            }

        }

        options.error && options.error.call(xhr, {
            status: xhr.status,
            statusText: xhr.statusText
        });

    };
    //我们在请求主体中传递给服务器的数据类型一般是json格式的字符串
    xhr.send(options.data);
}


//把一个对象中的属性值和属性名编程是一个用&连接的字符串，例如：{name:"wpl",ahe:21}

function formatData(obj) {
    // {name:"wpl",ahe:21}
    //
    /*    if (Object.prototype.toString.call(obj) !== '[object Object]') {*/
    if (({}).toString.call(obj) !== '[object Object]') {

        return;
    }  //如果成立的话就是对象
    var res = '';
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            res += key + '=' + obj[key];
            res += '&';
        }
    }
    res = res.substr(0, res.length - 1);
    return res;
}





