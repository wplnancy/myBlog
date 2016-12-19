/**
 * Created by Administrator on 2016/12/8.
 */
//1.获取元素

var banner = document.getElementById("banner");
var bannerInner = utils.getElesByClass("bannerInner", banner)[0];
var focusList = utils.getElesByClass("focusList", banner)[0];
//var left = utils.getElesByClass('left', banner)[0];
//var right = utils.getElesByClass('right', banner)[0];
var left = utils.children(banner, "a")[0];
var right = utils.children(banner, "a")[1];
var imgs = bannerInner.getElementsByTagName('img');
var lis = focusList.getElementsByTagName('li');


var isOkClick = true;

//获取数据
var data = null;
;
(function () {
    var xhr = new XMLHttpRequest();
    //保证不一样是拼接时间戳 这个url保证每次请求都不一样
    //  data.txt?set=girl&marry=false
    xhr.open("get", 'data.txt?_=' + Math.random(), false);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && /^2\d{2}$/.test(xhr.status)) {
            //304表示的是从本地缓存获取的数据  cache  这个变化的数据一定不能读缓存
            data = JSON.parse(xhr.responseText);
        }
    };
    xhr.send(null);
})();


//绑定数据
;
(function bindData() {
    if (data && data.length) {
        var str = '';
        var strLi = '';
        for (var i = 0; i < data.length; i++) {
            var curDataObj = data[i];
            str += '<div><img src="" alt="" data-src="' + curDataObj.src + '"/></div>';
            //只有当i==0的时候才需要加上类名selected
            strLi += i == 0 ? '<li class="selected"></li>' : '<li></li>';
        }
        str += '<div><img src="" alt="" data-src="' + data[0].src + '"/></div>';
        //改变banner的宽度
        utils.css(bannerInner, 'width', (data.length + 1) * 800);
        bannerInner.innerHTML = str;
        focusList.innerHTML = strLi;
    }
})();


//验证图片的有效性
;
(function () {
    for (var i = 0; i < imgs.length; i++) {
        //自定义属性   一般配合this一起来使用 this必然是事件中的this。所以自定义属性必然添加到绑定时间的元素上
        var curImg = imgs[i];
        var tempImg = new Image();
        tempImg.index = i;
        tempImg.src = curImg.getAttribute("data-src");
        tempImg.onload = function () {
            imgs[this.index].src = this.src;
            animate({
                ele: imgs[this.index],
                target: {
                    opacity: 1
                },
                duration: 1000
            });
        };
    }
})();


//5、开始轮播
var step = 0;//保存当前应该是哪一张图片显示
var timer = null;
timer = window.setInterval(autoMove, 2000);
function autoMove() {
    if (isOkClick) {
        isOkClick=false;
        if (step == data.length) {
            step = 0;
            utils.css(bannerInner, {left: -step * 800});
        }
        step++;//++之后的值才是我要运动的重点的值
        animate({
            ele: bannerInner,
            target: {
                left: -step * 800
            },
            duration: 500,
            //在动画执行完成之后开启可以点击按钮
            callback: function () {
                isOkClick = true;
            }
        });
        focusAlign();
    }
}
right.onclick = autoMove;
left.onclick = function () {
    if (isOkClick) {
        isOkClick=false;
        if (step == 0) {
            step = data.length;
            utils.css(bannerInner, {left: -step * 800});
        }
        step--;
        animate({
            ele: bannerInner,
            target: {
                left: -step * 800
            },
            duration: 500,
            callback: function () {
                isOkClick = true;
            }
        });
        focusAlign();
    }
};


//绑定事件
banner.onmouseover = function () {
    window.clearInterval(timer);//清除定时器
    left.style.display = right.style.display = "block";
};
banner.onmouseout = function () {
    timer = window.setInterval(autoMove, 1000);
    left.style.display = right.style.display = "none";
};


//焦点对齐

function focusAlign() {
    var tempStep = step == data.length ? 0 : step;
    for (var i = 0; i < lis.length; i++) {
        i == tempStep ? lis[i].className = "selected" : lis[i].className = "";
    }
}

for (var i = 0; i < lis.length; i++) {
    lis[i].index = i;
    lis[i].onclick = function () {
        step = this.index;
        animate({
            ele: bannerInner,
            target: {
                left: -step * 800
            },
            duration: 500
        });
        focusAlign();
    }

}




