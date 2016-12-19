/**
 * Created by Administrator on 2016/12/4.
 */
var utils = (function () {
    function listToArray(likeAry) {
        try {
            return Array.prototype.slice.call(likeAry, 0);
        } catch (e) {
            var newArr = [];
            for (var i = 0; i < likeAry.length; i++) {
                newArr[newArr.length] = likeAry[i];
            }
            return newArr;
        }
    }

    function jsonParse(jsonStr) {
        return 'JSON' in Window ? JSON.parse(jsonStr) : eval('(' + jsonStr + ')');
    }

    function win(attr, val) {
        //在测试的时候一定要设置body 的高度保证页面中出现滚动条
        if (val == undefined) {
            return document.documentElement[attr] || document.body[attr];
        }
        //设置属性的值
        document.documentElement[attr] = val;
        document.body[attr] = val;
    }

    function offset(ele) {
        var l = null;
        var t = null;
        var parent = ele.offsetParent;
        l += ele.offsetLeft;
        t += ele.offsetTop;
        while (parent) {
            if (!/MSIE 8/.test(window.navigator.userAgent)) {
                l += parent.clientLeft;
                t += parent.clientTop
            }
            l += parent.offsetLeft;
            t += parent.offsetTop;
            parent = parent.offsetParent;
        }
        return {
            "left": l,
            "top": t
        }
    }

    function getRandom(n, m) {
        n = Number(n);
        m = Number(m);
        if (isNaN(n) || isNaN(m)) {
            return Math.random();
        }
        if (n > m) {
            var temp = n;
            n = m;
            m = temp;
        }
        return Math.round(Math.random() * (m - n) + 1);
    }

    function getCss(attr) {
        var val = null;
        if (window.getComputedStyle) {
            //标准的浏览器
            val = window.getComputedStyle(this, null)[attr];
        } else {
            //for ie
            if (attr == "opacity") {
                //alpha(opacity=30)
                val = this.currentStyle.filter;
                var reg = /alpha\(opacity=(\d+(?:\.\d+)?)\)/;
                val = reg.test(val) ? reg.exec(val)[1] / 100 : 1;
            } else {
                val = this.currentStyle(attr);
            }
        }
        //去除单位
        //200px -0.55 block deg rem pt px
        reg = /^-?\d+(\.\d+)?(px|pt|rem|em|deg)?$/;//
        if (reg.test(val)) {
            val = parseFloat(val);
        }
        return val;
    }



    function setCss(attr, val) {
        if (attr == "opacity") {
            this.style.opacity = val;
            this.style.filter = "alpha(opacity=" + val * 100 + ")";
        }
        if (attr == "float") {
            this.style.cssFloat = val;//标准
            this.style.styleFloat = val;
        }
        //处理单位
        var reg = /^(width|height|top|left|right|bottom|(margin|padding)(Top|Left|Right|Bottom)?)$/
        if (reg.test(attr)) {
            if (!isNaN(val)) {
                val += 'px';
            }
        }
        this.style[attr] = val;
    }


    function setGroupCss(obj) {
        obj = obj || [];//保证obj.toString()不出错
        // Object.prototype.toString.call(obj) == '[object Object]'
        if (obj.toString() == "[object Object]") {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    setCss.call(this, key, obj[key]);//方法之间的调用
                }
            }
        }
    }


    //测试是否拥有某一个类的属性  这里只可以测试一个属性是否包含
    function hasClass(ele, classStr) {
        //??
        var reg = new RegExp('(^| +)' + classStr + '( +|$)', 'g');
        return reg.test(ele.className);
    }


    //添加类
    function addClass(ele, classNameStr) {
        //1、class没有才会被添加进来的
        var classNameAry = classNameStr.replace(/^ +| +$/g, '').split(/ +/);
        for (var i = 0; i < classNameAry.length; i++) {
            var curClass = classNameAry[i];
            var reg = new RegExp('(^| +)' + curClass + '( +|$)');
            if (!reg.test(ele.className)) {
                ele.className += " " + curClass;
            }
        }
    }

    //移除类
    function removeClass(ele, classNameStr) {
        var classNameAry = classNameStr.replace(/^ +| +$/g, '').split(/ +/);
        for (var i = 0; i < classNameAry.length; i++) {
            var curClass = classNameAry[i];
            var reg = new RegExp('(^| +)' + curClass + '( +|$)');
            //将匹配到的元素用空格进行替换
            ele.className = ele.className.replace(reg, ' ');
        }
    }

    //验证是否包含某个类名 支持  containClass(ele,"c1 c2");=>这个要同时包含才能够满足需求

    function containClass(ele, classStr) {
        //1、首先ele.className要去掉空格
        var reg = /^ +| +$/g;
        var eleClassName = ele.className.replace(reg, '');
        //2、拆分classStr
        var classStrAry = classStr.replace(reg, '').split(/ +/);
        //3 测试匹配是否能够成功
        isContain = true;//假设开始的时候是包含的
        for (var i = 0; i < classStrAry.length; i++) {
            var curClass = classStrAry[i];
            //让拆分过后的每一个curClass去匹配eleClassName
            var reg = new RegExp('(^| +)' + curClass + '( +|$)');
            if (!reg.test(eleClassName)) {
                isContain = false;
                break;
            }
        }
        return isContain;
        //返回测试结果
    }


    //根据class获取元素集合
    function getElesByClass(className, context) {
        context = context || document;
        /*  if(document.getElementsByClassName){
         return listToArray(document.getElementsByClassName(className));
         }*/
        var ary = [];
        var classNameAry = className.replace(/^ +| +$/g, '').split(/ +/);
        var eles = listToArray(context.getElementsByTagName("*"));
        for (var i = 0; i < eles.length; i++) {
            var curEle = eles[i];
            var isGoodEle = true;
            for (var j = 0; j < classNameAry.length; j++) {
                var curClass = classNameAry[j];
                var reg = new RegExp('(^| +)' + curClass + '( +|$)');
                if (!reg.test(curEle.className)) {
                    //如果验证不通过
                    isGoodEle = false;
                    break;
                }
            }
            if (isGoodEle) {
                ary.push(curEle);
            }
        }
        return ary;
    }


    //根据 参数类型 的不同做出不同的判断
    function css(ele) {
        var secondParam = arguments[1];
        var thirdParam = arguments[2];
        var argumentsAry = listToArray(arguments).slice(1);//从第二项开始截取
        if (typeof secondParam == "string") {
            if (typeof thirdParam == 'undefined') {
                //[ele,"width"]  这是获取width的值
                return getCss.apply(ele, argumentsAry);
            }
            //有三个的参数的情况下    //[ele,"width"，100]  设置width的值
            setCss.apply(ele, argumentsAry);
            return;
        }
        secondParam = secondParam || [];//保证tiString不报错
        if (secondParam.toString() == '[object Object]') {
            //批量的设置属性的值
            setGroupCss.apply(ele, argumentsAry);
        }
    }


    var isStandardBrowser = !!window.getElementsByClassName;//判断是ie678的情况下

    function children(ele, tagName) {
        tagName = tagName || '';
        //ie 6~8  在ie 6~8 的情况下 注释会算进去
        var ary = [];
        //if (!/MSIE [678]/.test(window.navigator.userAgent)) {
        if (!isStandardBrowser) {
            ary = listToAry(ele.children);
        } else {
            var childNodes = ele.childNodes;
            for (var i = 0; i < childNodes.length; i++) {
                if (childNodes[i].nodeType === 1) {
                    //元素节点
                    ary.push(childNodes[i]);
                }
            }
        }
        if (typeof tagName == "string") {//在所有的子元素中过滤出tagName的标签
            for (var i = 0; i < ary.length; i++) {
                if (ary[i].nodeName !== tagName.toUpperCase()) {//转换为大写的字母
                     ary.splice(i,1);
                     i--;
                 /*
                   ary[i] = ary[ary.length - 1];
                    ary.length--;
                    i--;*/
                }
            }
            return ary;
        }
        return ary;
    }


    function listToAry(ary) {
        try {
            return Array.prototype.slice.call(ary, 0);
        } catch (e) {
            //IE8以下
            var newAry = [];
            for (var i = 0; i < ary.lentgh; i++) {
                newAry[newAry.length] = ary[i];
            }
            return newAry;
        }
    }


    function prev(ele) {
        if (isStandardBrowser) {
            return ele.previousElementSibling;
        }
        //pre.previousSibling如果没有，则返回的是null
        var pre = ele.previousSibling;
        while (pre && pre.nodeType != 1) {
            pre = pre.previousSibling;
        }
        return pre;
    }

    function prevAll(ele) {
        var ary = [];
        var pre = prev(ele);
        while (pre) {
            ary.push(pre);
            pre = prev(pre);
        }
        return ary;
    }


    function nextAll(ele) {
        var ary = [];
        var nextEle = next(ele);
        while (nextEle) {
            ary.push(next);
            nextEle = next(nextEle);
        }
        return ary;
    }


    function firstEleChild(ele) {
        // 先获取所有的元素子节点，那么所有元素子节点中索引0
        // 一个子节点都没有？？  null
        if (isStandardBrowser) {
            return ele.firstElementChild;
        }
        var allChildren = this.children(ele);
        return allChildren.length > 0 ? childs[0] : null;
    }


    function lastEleChild(ele) {
        if (isStandardBrowser) {
            return ele.lastElementChild;l
        }
        var allChildren = this.children(ele);
        return allChildren.length > 0 ? allChildren[allChildren.length - 1] : null;
    }




    function next(ele) {
        if (isStandardBrowser) {
            return ele.nextElementSibling;
        }
        var nextEle = ele.nextSibling;
        while (nextEle && nextEle.nodeType != 1) {
            nextEle = nextEle.nextSibling;
        }
        return nextEle;
    }


    function siblings(ele) {
        //除了自己的所有兄弟元素  prevAll  nextAll
        return this.prevAll(ele).concat(this.nextAll(ele));
    }

    function sibling(ele) {
        //获取相邻的元素prev+next
        /*
         prev 没有  next 没有
         [undefined ,undefined]  void 0 === undefined==>true
         */
        var ary = [];
        var pre = prev(ele);
        var nextEle = next(ele);
        pre ? ary.push(pre) : void 0;
        nextEle ? ary.push(nextEle) : void 0;
        return ary;
    }


    function index(ele) {
        //获取ele的索引
        return prevAll(ele).length;//获取所有哥哥的个数  由于不包含自己在内
    }


    function append(ele, container) {
        container.appendChild(ele);
    }

    function prepend(ele, container) {
        var first = this.firstEleChild(container);
        first ? container.insertBefore(ele, first) : container.appendChild(ele);
    }

    function insertBefore(oldEle, newEle) {
        oldEle.parentNode.insertBefore(newEle, oldEle);
    }

    function insertAfter(oldEle, newEle) {
        var next = this.next(oldEle);
        next ? oldEle.parentNode.insertBefore(newEle, next) : oldEle.parentNode.appendChild(newEle);
    }


    return {
        listToArray: listToArray,
        jsonParse: jsonParse,
        win: win,
        offset: offset,
        //getCss: getCss,
        // setCss: setCss,
        getRandom: getRandom,
        // setGroupCss: setGroupCss,
        getElesByClass: getElesByClass,
        hasClass: hasClass,
        containClass: containClass,
        addClass: addClass,
        removeClass: removeClass,
        css: css,
        children: children,
        prev: prev,
        next: next,
        siblings: siblings,
        nextAll: nextAll,
        prevAll: prevAll,
        sibling: sibling,
        index: index,
        insertAfter: insertAfter,
        firstEleChild: firstEleChild,
        lastEleChild: lastEleChild,
        insertBefore: insertBefore,
        prepend: prepend,
        append: append
    };
})();
