// components/tabBar/tabBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pageIndex: {
      type: Number,
      value: 0
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    list: [
      {
        pagePath: "/pages/index/index",
        iconPath: "/images/index.png",
        selectedIconPath: "/images/index_act.png",
        text: "首页"
      },
      {
        pagePath: "/pages/writenote/writenote",
        iconPath: "/images/writenote.png",
        selectedIconPath: "/images/writenote.png",
        text: "笔记"
      },
      {
        pagePath: "/pages/login/login",
        iconPath: "/images/login.png",
        selectedIconPath: "/images/login_act.png",
        text: "登录"
      }
    ]
  },
  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e){
      const data = e.currentTarget.dataset;
      const url = data.path;
      if(data.index!=this.properties.pageIndex){
        wx.switchTab({
          url
        });
      }
    },
  }
})
