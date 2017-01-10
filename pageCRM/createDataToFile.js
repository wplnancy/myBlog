/**
 * Created by Administrator on 2017/1/10.
 */

function getRandom(n, m) {
    return Math.round(Math.random() * (m - n) + n);
}

var str1 = '赵钱孙李周吴郑王冯陈诸卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎';

var str2 = '是我国第一部词典正也即指解释词义近于雅正合于规范是我国最早的训解词义专著也是最早的名物百科辞典被认为是中国训诂的开山之作是我国第一部按义类编排的综合性辞书，是疏通包括五经在内的上古文献中词语古文的重要工具书尔雅首创的按意义分类编排的体例和多种释词方法对后代词书类书的发展产生了很大的影响';

var ary=(function createData(num) {
    var ary=[];
    for (var i = 0; i < num; i++) {
        var obj = {};
        obj.id = i + 1;
        obj.name = str1.charAt(getRandom(0, str1.length - 1)) + str2.charAt(getRandom(0, str2.length - 1)) + str2.charAt(getRandom(0, str2.length - 1));
        obj.sex = getRandom(0, 1);
        obj.score = getRandom(55, 99);
        ary.push(obj);
    }
    return ary;
})(1000);

var fs = require('fs');
fs.writeFileSync('./data.json', JSON.stringify(ary),'utf-8');