// components/bac/bac.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: "语析笔记"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight: wx.getSystemInfoSync()['statusBarHeight'],
    statusFontHeight: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },

  /**
   * 组件的生命周期
   */
  ready: function () {
    //自定义组件需要.in(this)
    let selQuery = wx.createSelectorQuery().in(this);
    selQuery.select('#title').boundingClientRect(rect=>{
      if(rect.height)
      this.setData({
        statusFontHeight: rect.height
      })
    }).exec();
  }
})
