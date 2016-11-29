/**
 * Created by Administrator on 2016/11/24.
 */
//获取元素
var tab = document.getElementById("tab"),
    head = tab.tHead,
    theadRow = head.rows[0],//获取tHead的第一行
    ths = theadRow.cells,//获取表头所有的列
    tBody = tab.tBodies[0],//获取tBody，因为一个table可能有多个tbody
    tBodyRows = tBody.rows;

//ajax获取数据
var data = null;
;
(function () {
    var xhr = new XMLHttpRequest();
    xhr.open('get', 'data.txt', false);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            data = toJson(xhr.responseText);
            console.log(data);
        }
    };
    xhr.send(null);
})();

//把获取到的数据添加到页面中
;
(function bindData() {
    var frg = document.createDocumentFragment();
    if (data && data.length) {//data有数据并且它的长度还是大于0，保证获取到的数据不是一个空数组
        for (var i = 0; i < data.length; i++) {
            var tr = document.createElement("tr");
            var curDataObj = data[i];
            for (var key in curDataObj) {
                var td = document.createElement("td");
                if (key === "develop") {
                    td.innerHTML = curDataObj[key] === 0 ? "发展中" : "发达";
                } else {
                    td.innerHTML = curDataObj[key];
                }
                tr.appendChild(td);
            }
            frg.appendChild(tr);
        }
        tBody.appendChild(frg);
    }
})();

//数组转换为类数组
function listToArry(likeArr) {
    try {
        return [].slice.call(likeArr, 0);
    } catch (e) {
        var newArr = [];
        for (var i = 0; i < likeArr.length; i++) {
            newArr[newArr.length] = likeArr[i];
        }
        return newArr;
    }
}

//隔行变色的效果
function changBg() {
    var tBodyRowsAry = listToArry(tBodyRows);//类数组转换为数组的形式
    for (var i = 0; i < tBodyRowsAry.length; i++) {
        tBodyRowsAry[i].className = "bg" + i % 2;
    }
}
changBg();

//点击排序的功能

var currentEditing = -1;
;
(function () {
    var thsAry = listToArry(ths);
    for (var i = 0; i < thsAry.length; i++) {
        thsAry[i].index = i;
        thsAry[i].sortFlag = -1;
        var n = null;

        if (thsAry[i].className === "cursor") {
            thsAry[i].onclick = function () {
                //this代表的是当前的那个点击的th
                tableSort.call(this);//使用call方法改变this的指向
                n = this.index;
                changBg();
            }
        }
    }
})();


//实现表格排序
function tableSort() {
    /*

     //方法一：
     for (var i = 0; i < ths.length; i++) {
     if (ths[i] !== this) {
     ths[i].sortFlag = -1;
     }
     }
     */

    /*
     //方法二

     if (this.isFirst) {//true
     this.isFirst = false;
     }currentEditing
     if (!this.isFirst && currentEditing !== this.index) {
     currentEditing = this.index;//
     this.sortFlag = -1;//-1
     }*/

    //方法三
    if (n !== this.index) {
        this.sortFlag = -1;
    }

    this.sortFlag *= -1;
    if (this.isFirst) {
        this.lastId = this.index;
    }

    var that = this;
    var tBodyRowsAry = listToArry(tBodyRows);
    tBodyRowsAry.sort(function (tr1, tr2) {
        var _a = tr1.cells[that.index].innerHTML,
            _b = tr2.cells[that.index].innerHTML;
        if (isNaN(_a) || isNaN(_b))//只要有一个不是数字就满足条件
            return (_a.localeCompare(_b)) * that.sortFlag;
        else {
            return (_a - _b) * that.sortFlag;
        }
    });

    //上面试排列好了的
    var frg = document.createDocumentFragment();
    for (var i = 0; i < tBodyRowsAry.length; i++) {
        frg.appendChild(tBodyRowsAry[i]);
    }
    tBody.appendChild(frg);
    frg = null;//释放内存
}


//处理IE7以下的兼容性问题
function toJson(jsonStr) {
    return 'JSON' in window ? JSON.parse(jsonStr) : eval('(' + jsonStr + ')')
}

