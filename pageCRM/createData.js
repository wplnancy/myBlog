/**
 * Created by Administrator on 2017/1/2.
 */

//创建随机数
function getRandom(n, m) {
    return Math.round(Math.random() * (m - n) + n);
}


var str1="赵钱孙李周吴郑王陈楚魏蒋";//[0-11]
var str2="一二三四五六七八九壹贰叁肆伍陆柒扒玖";//[0,17]



var ary = [];
for (var i = 0; i < 99; i++) {
    obj = {};
    obj["id"] = i;
    obj["name"] = str1[getRandom(0,1)]+str2[getRandom(0,11)]+str2[getRandom(0,11)];
    obj["sex"] = getRandom(0,1);
    obj["score"] = getRandom(50,99);
    ary.push(obj);
}
console.log(JSON.stringify(ary));


