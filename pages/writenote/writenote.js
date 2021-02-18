// 在需要使用的js文件中，导入js
var util = require('../../utils/getTime.js');
Page({
  data: {
 
  },
  onLoad: function () {
    // 调用函数时，传入new Date()参数，返回值是日期和时间
    var time = util.formatTime(new Date());
    // 再通过setData更改Page()里面的data，动态更新页面的数据
    this.setData({
      time: time
    });
  }
 
})