/**
 * Created by Administrator on 2016/11/14.
 */
    //场景应用不需要自由切换
window.onload = function () {
    //解决移动端300ms的延时
    var mySwiper = new Swiper('.swiper-container', {
        direction: 'vertical',
        loop: true,
        //添加对应的id来显示对应的动画
        onSlideChangeEnd: function (swiper) {
            var total = swiper.slides.length;
            var slideArr=swiper.slides;
            var n = swiper.activeIndex;
          /*  [].forEach.call(slideArr,function(slide,index){
                if(n==index){
                    slide.id=(n==1||n==3)?"page1":"page2";
                    return ;
                }
                slide.id=null;
            })*/

            var targetId="page";
            switch(n){
                case 0:
                    targetId+=total-2;
                    break;
                case (total-1):
                    targetId+=1;
                    break;
                default :
                    targetId+=n;
            }
            //slideArr是一个类数组，借用数组原型链行的方法
            [].forEach.call(slideArr,function(slide,index){
                if(n==index){
                    //如果当前的索引和index相等的情况下，设置id,否则移除该id
                    slide.id=targetId;
                }else{
                    slide.id=null;
                }
            });
        }
    });

    //设置rem布局
    (function () {
        var desW = 640;
        var winW = document.documentElement.clientWidth;
        var ratio = winW / desW;
        var oMain = document.getElementById("content");
        if (winW > desW) {
            oMain.style.margin = "0 auto";
            oMain.style.width = desW + "px";
            return;
        }
        document.documentElement.style.fontSize = ratio * 100 + "px";
    })();

    oMusic=document.getElementById("music");
    oMusicAudio=document.getElementById("musicAudio");
    window.setTimeout(function(){
        oMusicAudio.play();//->让音频播放:浏览器开始下载资源文件,也就是让它播放到出声音还需要一段时间,只有发出声音后我们才会显示音乐的图标
        oMusicAudio.addEventListener("canplay",function(){
            oMusic.style.display="block";
            oMusic.className="music move";
        },false);
    },1000);
    oMusic.addEventListener("click",function(){
        //如果当前是暂停的状态我让其播放
        if(oMusicAudio.paused){
            oMusicAudio.play();
            music.className="music move";
            return;
        }
        //当前的播放状态我让其暂停
        oMusicAudio.pause();
        music.className="music";
    },false);








};