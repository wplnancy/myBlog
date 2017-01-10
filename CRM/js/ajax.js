/**
 * Created by Administrator on 2016/12/30.
 */
//ajax：实现ajax请求的公共方法
;(function () {
    function createXHR() {
        //创建ajax对象，兼容所有的浏览器  思想：函数重新覆盖
        var xhr = null;
        var flag = false;
        ary = [
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
            var curFn = ary[i];
            try {
                xhr = curFn();
                //本次循环获取的方法执行没有出现错误
                //说明此方法是我想要的，我们下一次直接执行这个方法即可，我们把createXHR重写为小方法
                createXHR = curFn;
                flag = true;
                break;//完成之后不需要再判断后面的，直接退出循环即可
            } catch (e) {
                //本次循环获取的方法执行出现错误，继续执行下一次的循环debugger

            }
        }
        if (!flag) {
            //没有一个是支持的
            throw  new Error("you browser is not support ajax,please change you browse's version,try again");
        }
        return xhr;
    }
    function ajax(options) {
        //把需要使用的参数值设定一个规则和初始值
        var _default = {
            url: "",//请求的地址
            type: "get",//请求的方式
            dataType: "json",//设置请求回来的内容格式  json  就是json格式的对象   txt  就是字符串或者是json格式的字符串
            async: true,//请求是同步还是异步
            data: null,//放在请求主体中的内容
            getHead: null,//当readystate==2时执行的回调函数
            success: null//当readystate==4的时候执行的回调方法
        };

        //使用用户自己传递进来的值覆盖我们的默认值
        for (var key in options) {
            if (options.hasOwnProperty(key)) {//只遍历私有的
                _default[key] = options[key];

            }
        }
        var xhr = createXHR();
        //如果当前的请求的方式是get的话，我们需要在url的末尾交随机数清除缓存
        if (_default.type === "get") {
            // 如果原本是"/getList?name=zf" 的时候 就要判断之前的url是否包含了&
            _default.url.indexOf("?") >= 0 ? _default.url += "&" : _default.url += "?";
            _default.url += '_=' + Math.random();
        }
        xhr.open(_default.type, _default.url, _default.async);
        xhr.onreadystatechange = function () {
            if (/^2\d{2}$/.test(xhr.status)) {
                //想要在readyState=2的时候做一些操作，需要保证ajax是异步请求
                if (xhr.readyState === 2) {
                    if (typeof _default.getHead === "function") {
                        _default.getHead.call(xhr);//在函数里面可以使用xhr.getResponseHeaders()的方法
                    }

                }
                if (xhr.readyState === 4) {

                    var val = xhr.responseText;
                    //如果传递是参数值是json，说明获取的内容应该是json格式的对象
                    if (_default.dataType === 'json') {
                        val = "JSON" in window ? JSON.parse(val) : eval('(' + val + ')');
                    }
                    //使用逻辑&的方式处理
                    _default.success && _default.success.call(xhr, val);
                }
            }
        };
        xhr.send(_default.data);//在请求主体中传递内容
    }

    window.ajax = ajax;
})();
