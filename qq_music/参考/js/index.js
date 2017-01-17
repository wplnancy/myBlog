/*--REM--*/
~function () {
    var $music = $('.music'),
        $desW = 640,
        $winW = document.documentElement.clientWidth,
        htmlFont = 100;
    window.htmlFont = htmlFont = $winW / $desW * 100;
    if ($winW > $desW) {
        $music.css({
            width: $desW,
            margin: '0 auto'
        });
        return;
    }
    document.documentElement.style.fontSize = htmlFont + 'px';
}();

/*--main--*/
~function () {
    var $main = $('.main'),
        $header = $('.header'),
        $footer = $('.footer');
    var winH = document.documentElement.clientHeight;
    $main.css('height', winH - $header[0].offsetHeight - $footer[0].offsetHeight - 0.8 * htmlFont);
}();

/*--RENDER--*/
var controlRender = (function () {
    var $musicAudio = $('#musicAudio'),
        musicAudio = $musicAudio[0];

    var $musicBtn = $('.musicBtn'),
        $musicBtnPlay = $musicBtn.eq(0),
        $musicBtnPause = $musicBtn.eq(1),
        $lyric = $('.lyric');

    var $progress = $('.progress'),
        $current = $progress.find('.current'),
        $duration = $progress.find('.duration'),
        $timeLine = $progress.find('.timeLine'),
        $timeLineItem = $timeLine.find('span');

    var $musicPlain = $.Callbacks(),
        duration = 0,
        musicTimer = null,
        step = 0;

    function zero(value) {
        return value < 10 ? '0' + value : value;
    }

    //->控制自动播放
    $musicPlain.add(autoPlay);
    function autoPlay() {
        musicAudio.play();
        $musicAudio.on('canplay', function () {
            $musicBtnPlay.css('display', 'none');
            $musicBtnPause.css('display', 'block');

            //->计算总时间
            duration = musicAudio.duration;
            var minute = Math.floor(duration / 60),
                second = Math.floor(duration - (minute * 60));
            $duration.html(zero(minute) + ':' + zero(second));
        });
    }

    //->控制播放和暂停
    $musicPlain.add(playPause);
    function playPause() {
        $musicBtn.tap(function () {
            if (musicAudio.paused) {//->当前为暂停状态
                musicAudio.play();
                $musicBtnPlay.css('display', 'none');
                $musicBtnPause.css('display', 'block');
                return;
            }
            musicAudio.pause();
            $musicBtnPlay.css('display', 'block');
            $musicBtnPause.css('display', 'none');
        });
    }

    //->当音乐播放中控制歌词对应和进度改变
    $musicPlain.add(musicChange);
    function musicChange() {
        var $list = $lyric.children('p');

        musicTimer = window.setInterval(function () {
            var currentTime = musicAudio.currentTime,
                minute = zero(Math.floor(currentTime / 60)),
                second = zero(Math.floor(currentTime - minute * 60));
            if (currentTime >= duration) {
                window.clearInterval(musicTimer);
                $musicBtnPlay.css('display', 'block');
                $musicBtnPause.css('display', 'none');
                return;
            }
            //->显示当前播放时间
            $current.html(minute + ':' + second);

            //->控制播放的进度
            $timeLineItem.css({
                transition: '.5s',
                width: (currentTime / duration) * 100 + '%'
            });

            //->控制歌词对应
            console.log(minute, second);
            $list.each(function (index, item) {
                var itemM = $(item).attr('minute'),
                    itemS = $(item).attr('second');

                if (itemM == minute && itemS == second) {
                    step++;
                    if (step >= 4) {
                        $lyric.css('top', -(step - 3) * .84 + 'rem');
                    }
                    $(item).addClass('bg').siblings().removeClass('bg');
                }
            });
        }, 1000);
    }

    //->解析和绑定数据
    function bindHTML(data) {
        var str = '';
        $.each(data, function (index, item) {
            str += '<p id="lyric' + item.id + '" minute="' + item.minute + '" second="' + item.second + '">' + item.content + '</p>';
        });
        $lyric.html(str);
        $musicPlain.fire();
    }

    return {
        init: function () {
            //->获取歌词数据
            $.ajax({
                url: 'lyric.json',
                type: 'get',
                dataType: 'json',
                success: function (result) {
                    if (result) {
                        result = result.lyric || '';

                        //->把内容区域的特殊标识进行替换
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

                        //->捕获歌词主体的内容和对应的时间
                        var data = [],
                            index = 0,
                            reg = /\[(\d+)&#58;(\d+)&#46;(?:\d+)\]([^&#]+)(&#10;)?/g;
                        result.replace(reg, function () {
                            index++;
                            var minute = arguments[1],
                                second = arguments[2],
                                content = arguments[3];
                            data.push({
                                num: index,
                                minute: minute,
                                second: second,
                                content: content
                            });
                        });
                        bindHTML(data);
                    }
                }
            });
        }
    }
})
();
controlRender.init();

