/**
 * Created by Administrator on 2017/1/16.
 */
~function (pro) {
    // 格式化时间
    function formatTime(template) {
        template = template || '{0}年{1}月{2}日{3}时{4}分{5}秒';
        var ary = this.match(/\d+/g);
        template = template.replace(/\{(\d)\}/g, function () {
            return (ary[arguments[1]] || '00').length < 2 ? '0' + ary[arguments[1]] : ary[arguments[1]];

        });
        return template;
    }

    pro.formatTime = formatTime;

}(String.prototype);

// 计算main区域的高度

~function () {
    var $header = $('.header');
    var $main = $('main');
    var $menuNav = $main.children('.menuNav');

    function fn() {
        var winH = $(window).innerHeight();
        var headerH = $header.outerHeight();
        var resultH = winH - headerH - 40;
        $main.css('height', resultH);
        $menuNav.css('height', resultH - 2);
    }

    fn();
    $(window).on('resize', fn);
}();


//单例模式中的命令模式
var menuRender = (function () {
    var $menuNav = $('.menuNav'),
        $link = $menuNav.find(a),
        $exampleIS = null;
    //实现局部区域的滚动
    function completeScroll() {
        $exampleIS = new IScroll('.menuNav', {
            scrollbar: true,
            fadeScrolllbars: true,
            mouseWheel: true,
            bounce: false,
            userTransform: false
        });
    }

    //根据hash值定位到具体的某一个位置
    function toLocation() {
        var nowURL = window.location.href,
            hash = nowURL.substring(nowURL.indexOf('#'));
        var $tar = $link.filter('[href="' + hash + '"]');
        //如果没有找到的话，就定位到第一个上
        $tar.length === 0 ? $tar.eq(0) : null;
        //scrollToElement  里面使用的是原生的dom对象的
        $exampleIS.scrollToElement($tar[0], 300);
        //控制右侧日历展示不同的信息
        calendarRender.init($tar.attr('data-id'));
    }

    function bindEvent() {
        $link.on('click', function () {
            var _this = this;
            $.each(function (index, item) {
                item === _this ? $(item).addClass('bg') : $(item).removeClass('bg');
            });

        });
    }

    return {
        init: function () {
            completeScroll();
            toLocation();
            bindEvent();
        }
    }

})();
menuRender.init();

var calendarRender = (function () {
    var $calendarPlan = $callback();
    var $calendar = $('.calendar'),
        $wrapper = $calendar.find('.wrapper'),
        $btn = $calendar.find('.btn'),
        $link = null;
    var maxL = 0, minL = 0;

    //数据绑定
    $calendarPlan.add(function (today, data, columnId) {
        var str = "";
        $.each(data, function (index, item) {
            str += '<li><a href="javascript:;" data-time="' + item.date + '">';
            str += '<span class="week">' + item.weekday + '</span>';
            str += '<span class="date">' + item.date.myFormatTime('{1}-{2}') + '</span>';
            str += '</a></li>';
        });
        //设置宽度
        $wrapper.html(str).css('width', data.length * 110);
        //数据绑定完成之后获取所有的a
        $link=$wrapper.find('a');
        minL=-(data.length-7)*110;
    });

    //定位到今天的日期的位置
    $calendarPlan.add(function (today,data,columnId) {
        var $tar=$link.filter('[data-time="'+today+'"]');
        if($tar.length==0){
            var todayTime=today.replace(/-/g,'');
            $link.each(function (index, item) {
                var itemTime=$(item).attr('data-time');
                itemTime=itemTime.replace(/-/g,'');
                if(itemTime>todayTime){
                    $tar=$(item);
                    return false;//结束each循环
                }
            });

        }
        if($tar.length===0){
            //如果还没有的话就定位到左后一个
            $tar=$link.eq($link.length-1);
        }

        var index=$(tar).parent().index(),
            curL=-index*110+330;
        curL=curL>maxL?maxL:(curL<minL?minL:curL);
        $tar.addClass('bg');
        $wrapper.css('left',curL);
    });
    //左右切换
     $calendar.add(function (today, data, columnId) {
         $btn.on('click',function(){
             var curL=parseFloat($wrapper.css('left'));
             if(curL%110!==0){
                 curL=Math.round(curL/110)*110;
             }
             $(this).hasClass('btnLeft')?curL+=770:curL-=770;
             curL=curL>maxL?maxL:(curL<minL?minL:curL);
             $wrapper.stop().animate({
                 left:curL
             },300,function () {
                 //计算开始位置的索引
                 var startIndex=Math.abs(curL)/110;
                 $link.eq(startIndex).addClass('bg').parent().siblings().children('a').removeClass('bg');
             });
         })
     });

    return {
        init: function (columnId) {
            $.ajax({
                url: 'http://matchweb.sports.qq.com/kbs/calendar?columnId=' + columnId,
                type: 'get',
                dataType: 'jsonp',
                success: function (result) {
                    if (result && result.code === 0) {
                        result = result.data;
                        var today = result.today;
                        var data = result.data;
                        $calendarPlan.fire(today, data, columnId);
                    }
                }
            });
        }
    }

})();





