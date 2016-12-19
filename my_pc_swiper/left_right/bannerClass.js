/**
 * Created by Administrator on 2016/12/8.
 */
function Carousel(container, url, interval) {
    //构造函数
    this.banner = container;
    this.url = url;
    this.interval = interval;
    this.bannerInner = utils.getElesByClass("bannerInner", this.banner)[0];
    this.focusList = utils.getElesByClass("focusList", this.banner)[0];
    this.left = utils.children(this.banner, "a")[0];
    this.right = utils.children(this.banner, "a")[1];
    this.imgs = this.bannerInner.getElementsByTagName('img');
    this.lis = this.focusList.getElementsByTagName('li');
    this.timer = null;
    this.isOkClick = true;
    this.step = 0;
    this.interval = interval || 2000;//在没有设置默认值的时候设置的是2000ms播放一次
    this.init();
}
//公用的方法

Carousel.prototype.getData = function () {
    var xhr = new XMLHttpRequest();
    xhr.open("get", this.url + '?_=' + Math.random(), false);
    var that = this;
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && /^2\d{2}$/.test(xhr.status)) {
            that.data = JSON.parse(xhr.responseText);
        }
    };
    xhr.send(null);
};

Carousel.prototype.bindData = function () {
    if (this.data) {
        var str = '';
        var strLi = '';
        for (var i = 0; i < this.data.length; i++) {
            var curDataObj = this.data[i];
            str += '<div><img src="" alt="" data-src="' + curDataObj.src + '"/></div>';
            strLi += i == 0 ? '<li class="selected"></li>' : '<li></li>';
        }
        str += '<div><img src="" alt="" data-src="' + this.data[0].src + '"/></div>';
        //改变banner的宽度
        utils.css(this.bannerInner, 'width', (this.data.length + 1) * this.banner.clientWidth);
        this.bannerInner.innerHTML = str;
        this.focusList.innerHTML = strLi;
    }
}

Carousel.prototype.imgDelayLoad = function () {
    for (var i = 0; i < this.imgs.length; i++) {
        var curImg = this.imgs[i];
        var tempImg = new Image();
        tempImg.index = i;
        tempImg.src = curImg.getAttribute("data-src");
        var that = this;
        tempImg.onload = function () {
            that.imgs[this.index].src = this.src;
            animate({
                ele: that.imgs[this.index],
                target: {
                    opacity: 1
                },
                duration: 500
            });
        };
    }
};

Carousel.prototype.autoMove = function () {
    var that = this;
    if (this.isOkClick) {
        this.isOkClick = false;
        if (this.step == this.data.length) {
            this.step = 0;
            utils.css(this.bannerInner, {left: -this.step * this.banner.clientWidth});
        }
        this.step++;//++之后的值才是我要运动的重点的值
        animate({
            ele: this.bannerInner,
            target: {
                left: -this.step * this.banner.clientWidth
            },
            duration: 500,
            callback: function () {
                that.isOkClick = true;
            }
        });
        this.focusAlign();
    }
};

Carousel.prototype.focusAlign = function () {
    var tempStep = this.step == this.data.length ? 0 : this.step;
    for (var i = 0; i < this.lis.length; i++) {
        i == tempStep ? this.lis[i].className = "selected" : this.lis[i].className = "";
    }
};

Carousel.prototype.buttonClick = function () {
    var that = this;
    this.right.onclick = function () {
        that.autoMove();
    };
    this.left.onclick = function () {
        if (that.isOkClick) {
            that.isOkClick = false;
            if (that.step == 0) {
                that.step = that.data.length;
                utils.css(that.bannerInner, {left: -that.step * that.banner.clientWidth});
            }
            that.step--;
            animate({
                ele: that.bannerInner,
                target: {
                    left: -that.step * that.banner.clientWidth
                },
                duration: 500,
                callback: function () {
                    that.isOkClick = true;
                }
            });
            that.focusAlign();
        }
    };
};

Carousel.prototype.mouseEvent = function () {
    var that = this;
    this.banner.onmouseover = function () {
        window.clearInterval(that.timer);//清除定时器
        that.left.style.display = that.right.style.display = "block";
    };
    this.banner.onmouseout = function () {
        that.timer = window.setInterval(function () {
            that.autoMove();//在这里修改this的指向
        }, that.interval);
        that.left.style.display = that.right.style.display = "none";
    };
};


Carousel.prototype.focusClick = function () {
    var that = this;
    for (var i = 0; i < this.lis.length; i++) {
        this.lis[i].index = i;
        this.lis[i].onclick = function () {
            that.step = this.index;
            animate({
                ele: that.bannerInner,
                target: {
                    left: -that.step * that.banner.clientWidth
                },
                duration: 500
            });
            that.focusAlign();
        }
    }
};


Carousel.prototype.init = function () {
    this.getData();
    this.bindData();
    this.imgDelayLoad();
    var that = this;
    this.timer = window.setInterval(function () {
        that.autoMove();
    }, this.interval);
    this.mouseEvent();
    this.buttonClick();
    this.focusAlign();
    this.focusClick();
};

