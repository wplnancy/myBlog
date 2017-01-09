/**
 * Created by Administrator on 2017/1/9.
 */
var focus = document.querySelector('.focus');
var slides = document.querySelectorAll('.slide');
var oClicks = focus.querySelectorAll('a');

var prev = document.querySelector('.prev');
var next = document.querySelector('.next');


var curIndex = 0;//记录当前的索引
prev.addEventListener("click", fn, false);
next.addEventListener("click", fn, false);


function fn() {
    [].forEach.call(slides, function (item, index) {
            var reg = /slideCur/;
            if (reg.test(item.classList)) {
                curIndex = index;
            }
            //把所有slide的slideCur类名去掉
            item.classList.remove('slideCur');
        }
    );
    var attr = this.dataset.attr;
    if (attr === 'prev') {
        curIndex = curIndex === 0 ? slides.length - 1 : curIndex - 1;
    } else if (attr === 'next') {
        curIndex = curIndex === slides.length - 1 ? 0 : curIndex + 1;
    }
    slides[curIndex].classList.add("slideCur");
    focusAlign();
}

var banner = document.querySelector('.banner');

function autoPlay() {
    [].forEach.call(slides, function (item, index) {
            var reg = /slideCur/;
            if (reg.test(item.classList)) {
                curIndex = index;
            }
            //把所有slide的slideCur类名去掉
            item.classList.remove('slideCur');
        }
    );
    curIndex = curIndex === 0 ? slides.length - 1 : curIndex - 1;
    slides[curIndex].classList.add("slideCur");
    focusAlign();
}


banner.onmouseenter = function () {
    window.clearInterval(banner.timer);
};
banner.onmouseout = function () {
    window.clearInterval(banner.timer);
    banner.timer = window.setInterval(function () {
        autoPlay();
    }, 3000);
};


// 焦点对齐

for (let i = 0; i < oClicks.length; i++) {
    oClicks[i].onclick = function () {
        //删除所有的
        for (var j = 0; j < slides.length; j++) {
            slides[j].classList.remove('slideCur');
        }
        slides[i].classList.add('slideCur');
        curIndex=i;
        focusAlign();
    };
}


function focusAlign() {
    for (var i = 0; i < oClicks.length; i++) {
        oClicks[i].className = curIndex == i ? "cur" : '';
    }
}









