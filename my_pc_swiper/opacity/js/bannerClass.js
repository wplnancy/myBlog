/**
 * Created by Administrator on 2016/12/8.
 */

//new Banner  就可以轮播图
function Banner(container, url, interval) {
    //  容器： container 根据容器去找下面的东西
    //  接口： url =>data.txt
    //interval  表示的是每隔多久播放一次
    //分析这个事件是不是每一个人都要执行的事情，如果是的话，要放在原型上，这是每一个轮播图必备的方法
    //用共有方法去操作私有属性

    /**
     *
     * 使用构造函数来封装：
     *    1、哪些应该放在共有原型上
     *    2、哪些应该放在私有的构造函数中
     *    3、利用在原型上的共有方法去操作私有属性
     *    4、哪些应该从外面的参数传进来
     *    5、实例在这里就是一个中间人的角色（既能找到原型上的公有的方法，还能获取到私有的属性）
     *    //利用共有的方法去操作私有的属性
     *    //把私有的东西放在属性上
     *    //如果没有函数就可以放心的修改this了
     *
     */

    this.banner = container;//container就相当于获取之后的document.getElementById('banner');
    this.url = url;
    this.bannerInner = utils.getElesByClass('bannerInner', this.banner)[0];
    this.focusList = utils.getElesByClass('focusList', this.banner)[0];
    this.left = utils.children(this.banner, 'a')[0];
    this.right = utils.children(this.banner, 'a')[1];
    this.imgs = this.bannerInner.getElementsByTagName("img");
    this.lis = this.focusList.getElementsByTagName('li');
    this.data = null;
    this.step = 0;
    this.timer = null;
    this.isOkClick = true;
    this.interval = this.interval || 2000;
    this.init();//执行结束之后才有轮播图
}

    Banner.prototype.getData = function () {
        var xhr = new XMLHttpRequest();
        //保证不一样是拼接时间戳 这个url保证每次请求都不一样
        //  data.txt?set=girl&marry=false
        var url=this.url + '?_=' + new Date().getTime();
        xhr.open("get", url, false);
        var that = this;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && /^2\d{2}$/.test(xhr.status)) {
                //304表示的是从本地缓存获取的数据  cache  这个变化的数据一定不能读缓存
                //此时的this是表示的是xhr
                that.data = JSON.parse(xhr.responseText);
                console.log(that.data);
            }
        };
        xhr.send(null);
    };
    Banner.prototype.bindData = function () {
        if (this.data) {
            var str = '';
            var strLi = '';
            for (var i = 0; i < this.data.length; i++) {
                var curDataObj = this.data[i];
                str += '<div><img src="" data-src="' + curDataObj.src + '" alt=""/></div>';
                strLi += i == 0 ? '<li class="selected"></li>' : '<li></li>';
            }
            this.bannerInner.innerHTML = str;
            this.focusList.innerHTML = strLi;
        }
    };
    Banner.prototype.imgDelayLoad = function () {
        var that = this;
        for (var i = 0; i < this.imgs.length; i++) {
            var curImg = this.imgs[i];
            var tempImg = new Image();
            tempImg.index = i;
            tempImg.src = curImg.getAttribute("data-src");
            tempImg.onload = function () {
                that.imgs[this.index].src = this.src;
                if (this.index === 0) {
                    utils.css(that.imgs[0].parentNode, 'zIndex', 1);
                    animate({
                        ele: that.imgs[0].parentNode,
                        target: {
                            opacity: 1
                        },
                        duration: 500
                    });
                }
            }
        }

    };
    Banner.prototype.autoMove = function () {
        if (this.step == this.data.length - 1) {
            this.step = -1;
        }
        this.step++;
        this.setImg();
    };
    Banner.prototype.setImg = function () {
        var that = this;
        for (var i = 0; i < this.imgs.length; i++) {
            if (i === this.step) {
                utils.css(this.imgs[i].parentNode, 'zIndex', 1);
                animate({
                    ele: this.imgs[i].parentNode,
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
                            that.isOkClick = true;
                        }, 100);
                    }
                });
                //焦点对齐

            } else {
                utils.css(this.imgs[i].parentNode, 'zIndex', 0);
            }
        }
        for (var i = 0; i < this.lis.length; i++) {
            this.lis[i].className = i == this.step ? "selected" : "";
        }
    };
    Banner.prototype.mouseEvent = function () {
        var that = this;
        this.banner.onmouseover = function () {
            window.clearInterval(that.timer);
            that.left.style.display = that.right.style.display = "block";
        };
        this.banner.onmouseout = function () {
            //这个定时器中的this是window  然而必须保证auto中的方法是实例
            //我们给autoMove包装了一个匿名函数，但是匿名函数中执行autoMove，这样autoMove方法中的this就是实例
            that.timer = window.setInterval(function () {
                that.autoMove();
            }, 2000);
            that.left.style.display = that.right.style.display = "none";
        };

    };
    Banner.prototype.buttonClick = function () {
        var that = this;
        this.right.onclick = function () {
            if (that.isOkClick) {
                that.autoMove();
            }
            that.isOkClick = false;
        };
        this.left.onclick = function () {
            if (that.isOkClick) {
                if (that.step == 0) {
                    that.step = that.data.length;
                }
                that.step--;
                that.setImg();
                that.isOkClick = false;
            }
        };
    };
    Banner.prototype.focusClick = function () {
        var that = this;
        for (var i = 0; i < this.lis.length; i++) {
            this.lis[i].index = i;
            this.lis[i].onclick = function () {
                that.step = this.index;
                that.setImg();
            }
        }
    };
    Banner.prototype.init = function () {
        //初始化  =>负责按照顺序去执行函数
        this.getData();
        this.bindData();
        this.imgDelayLoad();
        var that=this;
        this.timer = window.setInterval(function () {
            that.autoMove();
        }, this.interval);
        this.mouseEvent();
        this.focusClick();
        this.buttonClick();
    };
