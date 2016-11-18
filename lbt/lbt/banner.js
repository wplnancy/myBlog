/**
 * Created by Administrator on 2016/11/17.
 */
//-->手机不通屏幕的适配

document.documentElement.style.fontSize = document.documentElement.clientWidth / 640 * 100 + "px";

//-->  bannner render
var bannerRender = (function () {
    //获取dom对象
    var winW = document.documentElement.clientWidth;
    var $banner = $(".banner"),
        $wrapper = $(".wrapper"),
        $slideList = $wrapper.children(".slide"),
        $imgList = $wrapper.find("img"),
        oLis = $(".tip").children("li");//获取小圆点li

    var maxL = 0;//最大的left的值
    var minL = -($slideList.length - 1) * winW;//最小的left的值
    var step = 1;//-->step表示当前图片的索引
    var count = 0;//图片的张数
    var followTimer = null;//跟随的定时器
    var square = 0;//记录当前的小圆点


//->lazyImg  进行图片的延迟加载  让当前的活动块以及相邻的两个活动块进行加载，已经加载过的不在进行加载，通过索引得到当前的活动块
    function lazyImg() {
        //
        var $cur = $slideList.eq(step),
        //目标集合 $tar  每一次只能添加一个
            $tar = $cur.add($cur.prev()).add($cur.next());

        //console.log($tar);   总共获取到了三个

        $tar.each(function (index, item) {
            var $img = $(item).children("img");
            if ($img.attr("isLoad") === "true") {
                return;//不在进行加载的操作
            }
            var oImg = new Image();//创建一个新的图片
            oImg.src = $img.attr("data-src");
            console.log($img);
            //如果图片加载成功的话
            oImg.onload = function () {
                $img.attr({
                    src: this.src,
                    isLoad: true
                }).css("display", "block");
                oImg = null;
            }
        })

    }

    //->  控制swipe的滑动
    //->  touch  start
    function dragStart(ev) {
        //记录盒子的起始的位置
        var point = ev.touches[0];//存贮了第一根手指的信息
        $wrapper.attr({
            strL: parseFloat($wrapper.css("left")),//要去除单位
            strX: point.clientX,
            //pageX相当于body clientX相当于当前的屏幕，这样的话在这里是一样的
            strY: point.clientY,
            isMove: false,//记录是否移动  即判断是点击韩式滑动
            dir: null,//由于垂直的方向上不做处理，只需要处理水平的房型即可
            changeX: null//x轴的便宜的距离
        })
    }

    function isSwipe(strX, strY, endX, endY) {
        //这里返回的是一个真假的值
        //偏移值设置小一点这样的话就会使得便宜的时候变得更加的流畅
        return Math.abs(endX - strX) > 10 || Math.abs(endY - strY) > 10;
    }

    function swipeDir(strX, strY, endX, endY) {
        //判断是上下还是左右滑动
        return Math.abs(endX - strX) >= Math.abs(endY - strY) ? (endX - strX > 0 ? "right" : "left") : (endY - strY > 0 ? "down" : "up");
    }

    //->touch move
    function dragIng(ev) {
        var point = ev.touches[0],
            endX = point.clientX,
            endY = point.clientY,
            strX = parseFloat($wrapper.attr("strX")),
            strY = parseFloat($wrapper.attr("strY")),
            strL = parseFloat($wrapper.attr("strL")),
            changeX = endX - strX;
        var isMove = isSwipe(strX, strY, endX, endY),
            dir = swipeDir(strX, strY, endX, endY);
        //->计算出是否滑动以及滑动的方向   只有是左右滑动才进行处理

        //正则的时候匹配字符串的时候不要加引号
        if (isMove && /(left|right)/i.test(dir)) {
            //补齐改变的自定义的属性
            $wrapper.attr({
                isMove: true,
                dir: dir,
                changeX: changeX
            });
            //当我滑动的时候
            var curL = strL + changeX;//计算当前滑动的距离
            //边界的判断
            curL = curL > maxL ? maxL : (curL < minL ? minL : curL);
            $wrapper[0].style.webkitTranstion = "0s";
            $wrapper.css("left", curL);

        }

    }

    //焦点对齐全
    /*    页面中如果自己使用了touchmon=ve 等原生的事件，需要把浏览器的行为阻止掉*/

    $(document).on("touchmove touchstart touchend", function (ev) {
        ev.preventDefault();
    });

    function getFocus(num) {
        oLis.each(function (index, item) {
            if (num === index) {
                item.className = "bg";
            } else {
                item.className = "";
            }
        })
    }


    //->touch end
    function dragEnd(ev) {
        //由于这里手指已经离开了屏幕，座椅这里只能通过changeTouches来获取离开时候的手指的位置
        //如果发生了滑动的话  swiper只有滑动的距离超过半屏幕的时候才会滑动到下一张
        var dir = $wrapper.attr("dir"),
            changeX = $wrapper.attr("changeX"),
            isMove = $wrapper.attr("isMove");
        if (isMove && /(left|right)/i.test(dir)) {
            /* if(changeX<winW/2){
             //大于屏幕宽度的一般才会指向相关的操作
             step=step;//step不变
             }*/
            if (Math.abs(changeX) > winW / 2) {

                //大于屏幕宽度的一般才会指向相关的操作
                if (dir === "left") {
                    step++;
                    square++
                } else {
                    step--;
                    square--;
                }
                //这里要注意的是：square是先计算后做判断的
                if (square > oLis.length - 1) {
                    square = 0
                }
                if (square < 0) {
                    square = oLis.length - 1;
                }

                //已经得到了step的值   将jq对象转换为js对象
                $wrapper[0].style.webkitTranstion = ".2s";
                $wrapper.css("left", -step * winW);
                //动画运动的过程中 我们监听一个定时器，动画运动完成，判断是否到达边界，如果到达了边界，我们让其立马回到自己真实的位置
                lazyImg();
                getFocus(square);
                window.clearTimeout(followTimer);
                followTimer = window.setTimeout(function () {
                    if (step === 0 || step === count - 1) {
                        $wrapper[0].style.webkitTranstion = "0s";
                        step = step === 0 ? count - 2 : 1;
                        $wrapper.css("left", -step * winW);
                        //在执行加载图片
                        lazyImg();
                    }
                    /* if(step===0){
                     $wrapper[0].style.webkitTranstion = "0s";
                     $wrapper.css("left",-(count-2)*winW);
                     step=count-2;
                     }
                     if(step===(count-1)){
                     $wrapper[0].style.webkitTranstion = "0s";
                     $wrapper.css("left",-winW);
                     step=1;
                     }*/
                    window.clearTimeout(followTimer);
                }, 200);
            } else {
                $wrapper.css("left", -step * winW);
                getFocus(square);
            }
        }
    }

    return {
        init: function () {
            //->init css style
            count = $slideList.length;
            $wrapper.css("width", count * winW);
            $slideList.css("width", winW);

            $banner.on("touchstart", dragStart).on("touchmove", dragIng).on("touchend", dragEnd);//使用on的链式的写法绑定事件
            //样式初始化之后进行延迟加载
            lazyImg();//执行图片的延迟加载
        }
    }
})();


bannerRender.init();
