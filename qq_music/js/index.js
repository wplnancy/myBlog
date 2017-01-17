/*--REM--*/
~function () {
    var winW = document.documentElement.clientWidth,
        desW = 640,
        htmlFont = winW / desW * 100;
    //->当屏幕的宽度大于设计稿的宽度,让音乐区域最大640PX即可
    if (winW >= desW) {
        $('.musicBox').css({
            width: desW,
            margin: '0 auto'
        });
        window.htmlFont = 100;
        return;
    }
    window.htmlFont = htmlFont;
    document.documentElement.style.fontSize = htmlFont + 'px';
}();

/*--MAIN--*/
~function () {
    var winH = document.documentElement.clientHeight,
        headerH = $('.header')[0].offsetHeight,
        footerH = $('.footer')[0].offsetHeight;
    $('.main').css('height', winH - headerH - footerH - htmlFont * .8);
}();

// render
var musicRender = (function () {

    var musicTimer = null,
        step = 0;
    /*记录当前展示到那一句话了*/
    function formatTime(second) {
        var minute = Math.floor(second / 60),
            second = Math.floor(second - minute * 60)
        minute < 10 ? minute = '0' + minute : minute;
        second < 10 ? second = '0' + second : second;
        return minute + ':' + second;

    }


    var $musicPlain = $.Callbacks(),
        $lyric = $(".lyric"),
        $current = $('.current'),
        $duration = $('.duration'),
        $timeLineSpan = $('.timeLine span'),
        $musicBtn = $('.musicBtn'),
        $progress = $('.progress'),

        // 获取的结果依然是jq对象

        $musicBtnPlay = $musicBtn.eq(0),
        $musicBtnPause = $musicBtn.eq(1),
        musicAudio = $("#musicAudio")[0];//转换为原生对象
    // 数据订阅
    $musicPlain.add(function (data) {
        var str = '';
        $.each(data, function (index, item) {
            //自定义属性的规范化  data-属性名
            // 设置重复的id

            str += '<p data-minute="' + item.minute + '" data-second="' + item.second + '" id="lyric+' + item.id + '">' + item.content + '</p>';

        });
        $lyric.html(str);

    });
    $musicPlain.add(function () {
        musicAudio.play();
        musicAudio.addEventListener('canplay', function () {
            // 显示总时间   意思那个要保证音频加载了部分的信息了
            $duration.html(formatTime(musicAudio.duration));
            $musicBtnPlay.css("display", 'none');
            $musicBtnPause.css("display", 'block');

        }, false);
        musicAudio.addEventListener('ended', function () {
            $musicBtnPlay.css('display', 'block');
            $musicBtnPause.css('display', 'none');

        })


    });


    // 控制播放暂停
    $musicPlain.add(function () {
        //封装好了

        $musicBtn.tap(function () {
            if (musicAudio.paused) {
                //当前是暂停的状态
                musicAudio.play();
                $musicBtnPlay.css('display', 'none');
                $musicBtnPause.css('display', 'block');
                return;
            }
            musicAudio.pause();
            $musicBtnPlay.css('display', 'block');
            $musicBtnPause.css('display', 'none');
        });


    });


    // 追踪播放状态、
    $musicPlain.add(function () {
        musicTimer = window.setInterval(function () {
            if (musicAudio.currentTime > musicAudio.duration) {
                window.clearInterval(musicTimer);
            }
            // 获取当前已经播放的时间  控制显示当前的播放时间  还要控制进度条的改变
            var timeR = formatTime(musicAudio.currentTime),
                minute = timeR.split(':')[0],
                second = timeR.split(':')[1];

            $current.html(timeR);
            $timeLineSpan.css('width', (musicAudio.currentTime / musicAudio.duration) * 100 + '%');

            // 控制歌词对应

            // 先控制对应的行选中的样式  知道当前播放的事件对应的时分秒

            var $lyricList = $lyric.children('p');
            //同级帅选
            var $tar = $lyricList.filter('[data-minute="' + minute + '"]').filter('[data-second="' + second + '"]');
            $tar.addClass('bg').siblings().removeClass('bg');
            var n = $tar.index();
            if (n >= 3) {
                //已经播放发到第四条了  开始向上移动.84rem
                $lyric.css({
                    top: -.83 * (n - 2) + 'rem'
                })
            }
        }, 1000);


    });


    return {
        init: function () {
            //获取歌词数据
            $.ajax({
                url: "lyric.json",
                type: "get",
                dataType: 'json',
                cache: false,
                success: function (result) {
                    // console.log(result);
                    if (result) {
                        result = result.lyric || '';
                        // 解析数据
                        result = result.replace(/&#(\d+);/g, function () {
                            var num = Number(arguments[1]),
                                val = arguments[0];
                            switch (num) {
                                case 32:
                                    val = ' ';
                                    break;
                                case 40:
                                    val = '(';
                                    break;
                                case 41:
                                    val = ')';
                                    break;
                                case 45:
                                    val = '-';
                                    break;
                            }
                            return val;
                        });
                        var data = [];
                        reg = /\[(\d{2})&#58;(\d{2})&#46;(?:\d{2})\]([^&#]+)(?:&#10;)?/g,
                            index = 0;
                        result.replace(reg, function () {
                            data.push({
                                id: ++index,
                                minute: arguments[1],
                                second: arguments[2],
                                content: arguments[3]
                            });


                        });
                        // 通知计划表中的方法进行执行
                        $musicPlain.fire(data);


                    }
                }
            });

        }
    }
})();
musicRender.init();