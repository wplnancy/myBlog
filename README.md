# myBlog
我的个人博客
### 一些流行的页面效果的制作
* 1 微信场景应用
***
[点击访问][https://wplnancy.github.io/myBlog/weichat/]

* 2 移动端的轮播图的实现--zepto.js
***
[点击访问][https://wplnancy.github.io/myBlog/lbt/index.html]


* 3 表格排序
***
[查看效果][https://wplnancy.github.io/myBlog/table_sort/table.html]
```
 table_sort是一个表格排序，功能还是不错滴！
 注意事项： 
  1、显示小手的点击就可以排序，实现顺序和倒叙的切换
  2、文字和数字都可以进行排序
```

### 方法一
```
for (var i = 0; i < ths.length; i++) {
     if (ths[i] !== this) {
     ths[i].sortFlag = -1;
     }
}
```
### 方法二：
```
 var currentEditing = -1;//当前编辑的位置
;
(function () {
    var thsAry = listToArry(ths);
    for (var i = 0; i < thsAry.length; i++) {
        thsAry[i].index = i;
        thsAry[i].sortFlag = -1;
        if (thsAry[i].className === "cursor") {
            thsAry[i].onclick = function () {
                //this代表的是当前的那个点击的th
                tableSort.call(this);//使用call方法改变this的指向
                changBg();
            }
        }
    }
})();

  if (this.isFirst) {
     this.isFirst = false;
    }
     if (!this.isFirst && currentEditing !== this.index) {
     currentEditing = this.index;
     this.sortFlag = -1;
   }
```
### 方法三
 ```
         var n = null;
        if (thsAry[i].className === "cursor") {
            thsAry[i].onclick = function () {
                //this代表的是当前的那个点击的th
                tableSort.call(this);//使用call方法改变this的指向
                n = this.index;
                changBg();
            }
        }
        
    if (n !== this.index) {
        this.sortFlag = -1;
    }
        
        
 ```
