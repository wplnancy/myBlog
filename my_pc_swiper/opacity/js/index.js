/**
 * Created by Administrator on 2016/12/8.
 */
var banner = document.getElementById('banner');
var bannerInner = utils.getElesByClass('bannerInner', banner)[0];
var focusList = utils.getElesByClass('focusList', banner)[0];
var left = utils.children(banner, 'a')[0];
var right = utils.children(banner, 'a')[1];
var imgs = bannerInner.getElementsByTagName("img");
var lis = focusList.getElementsByTagName('li');

var data = null;
;
(function () {
    var xhr = new XMLHttpRequest();
    //保证不一样是拼接时间戳 这个url保证每次请求都不一样
    //  data.txt?set=girl&marry=false
    xhr.open("get", 'data.txt?_=' + new Date().getTime(), false);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && /^2\d{2}$/.test(xhr.status)) {
            //304表示的是从本地缓存获取的数据  cache  这个变化的数据一定不能读缓存
            data = JSON.parse(xhr.responseText);
        }
    }
    xhr.send(null);
})();

//绑定数据
;
(function () {
    if (data && data.length) {
        var str = '';
        var strLi = '';
        for (var i = 0; i < data.length; i++) {
            var curDataObj = data[i];
            str += '<div><img src="" data-src="' + curDataObj.src + '" alt=""/></div>';
            strLi += i == 0 ? '<li class="selected"></li>' : '<li></li>';
        }
        bannerInner.innerHTML = str;
        focusList.innerHTML = strLi;
    }
})();

//验证图片的有效性
;
(function () {
    for (var i = 0; i < imgs.length; i++) {
        var curImg = imgs[i];
        var tempImg = new Image();
        //给每一个临时的图片添加一个自定义的属性，用来保存这个临时图片，来保证是加载哪一张真实图片的去加载资源
        tempImg.index = i;
        tempImg.src = curImg.getAttribute("data-src");
        tempImg.onload = function () {
            //如果图片资源没有问题，那么这个事件可以触发 imgs.length 次
                imgs[this.index].src = this.src;
                if (this.index === 0) {
                    //如果是第一张的 话  把层级提高 透明度运动到1
                    //debugger;
                    utils.css(imgs[0].parentNode, 'zIndex', 1);
                    //改变透明度
                animate({
                    ele: imgs[0].parentNode,
                    target: {
                        opacity: 1
                    },
                    duration: 500
                });
            }
        }
    }
})();

//
var step = 0;//这个全局变量任然是记录的是应该显示的索引值

function autoMove() {
    if (step == data.length - 1) {
        step = -1;
    }
    step++;
    setImg();
}
var timer = null;
timer = window.setInterval(autoMove, 2000);

//这个函数负责循环所有的图片，然后比对哪一张的图片的 索引值和step值相等，索引和step相等的那一张图片的zIndex的值提高，除了这一张之外的设置为初始的状态0
//设置zIndex之后，接着设置opacity 0->1  ，之后把其他图片的透明度设置成0
function setImg() {
    for (var i = 0; i < imgs.length; i++) {
        if (i === step) {
            utils.css(imgs[i].parentNode, 'zIndex', 1);
            animate({
                ele: imgs[i].parentNode,
                target: {
                    opacity: 1
                },
                duration: 500,
                callback: function () {
                    //运动到达终点之后要完成的事情，把其他的图片设置为0
                    var otherDivs = utils.siblings(this);//除了自己的兄弟元素

                    //[div,div,div]
                    for (var i = 0; i < otherDivs.length; i++) {
                        utils.css(otherDivs[i], "opacity", 0);
                    }
                    window.setTimeout(function () {
                        isOkClick = true;
                    }, 100);
                }
            });
            //焦点对齐

        } else {
            utils.css(imgs[i].parentNode, 'zIndex', 0);
        }
    }
    focusAlign();
}

//焦点对齐
function focusAlign() {
    for (var i = 0; i < lis.length; i++) {
        lis[i].className = i == step ? "selected" : "";
    }
}

//给左右按钮绑定事件
banner.onmouseover = function () {
    window.clearInterval(timer);
    left.style.display = right.style.display = "block";
};
banner.onmouseout = function () {
    timer = window.setInterval(autoMove, 2000);
    left.style.display = right.style.display = "none";
};


//7 点击按钮
var isOkClick = true;

right.onclick = function () {
    if (isOkClick) {
        autoMove();
    }
    isOkClick = false;
};
left.onclick = function () {
    if (isOkClick) {
        if (step == 0) {
            step = data.length;
        }
        step--;
        setImg();
        isOkClick = false;
    }
};
//焦点点击
;
(function () {
    for (var i = 0; i < lis.length; i++) {
        lis[i].index = i;
        lis[i].onclick = function () {
            step = this.index;
            setImg();
        }
    }
})();