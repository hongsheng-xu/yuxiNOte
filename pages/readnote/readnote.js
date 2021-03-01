const { request } = require('../../utils/request')
//获取应用实例
const app = getApp();
Page({
  data: {
    note: {
      title: '',
      updateTime: '',
      content: ""
    },
    time: '',
    userInfo: {},
    token: "",
  },
  onLoad: async function (e) {
    if (!e.noteId) {
      wx.showToast({
        title: '你还没有笔记快去新建一个吧!',
        icon: 'none',
      });
      setTimeout((
      ) => {
        wx.switchTab({
          url: '/pages/writenote/writenote',
        });
      }, 1500)
      return;
    }
    let { noteId } = e;
    console.log("noteId: "+noteId);
    const res = await request({
      url: '/read-note',
      data: {
        noteId: noteId
      }
    })
    console.log(res);
    if (res.data.code == 200) {
      const { title, content, noteId } = res.data.data;
      let note = {
        title: title,
        content: content,
        noteId:noteId
      }
      this.setData({
        note
      })
      this.render(content)
    } else {
      wx.showToast({
        title: '加载内容失败,请重试!',
        icon: 'none',
      });
    }

  },
  onShow() {
    let userInfo = wx.getStorageSync("userInfo");
    let token = wx.getStorageSync("token");
    if (!token) {
      wx.switchTab({
        url: '/pages/login/login',
      });
      wx.showToast({
        title: '请先登录!',
        icon: 'none',
      });
      return;
    }
    this.setData({
      userInfo,
      token
    })
  },
  render(data) {
    const _ts = this;
    if (!data) {
      data = "语析笔记支持MarkDown啦!"
    }
    let articleData = app.towxml.toJson(data, 'markdown');
    console.log(articleData);
    articleData = app.towxml.initData(articleData, {
      base: 'http://81.71.89.149:9000/yuyi',
      app: _ts
    });
    //自定义事件，格式为`event_`+`绑定类型`+`_`+`事件类型`
    //例如`bind:touchstart`则为：
    this['event_bind_touchstart'] = (event) => {
      console.log(event.target.dataset._el);     // 打印出元素信息
    };

    // 给todoList添加监听事件
    this['eventRun_todo_checkboxChange'] = (event) => {
      console.log(event.detail);                // todoList checkbox发生change事件
    };
    articleData.theme = 'dark';
    _ts.setData({
      article: articleData,
    });
  },
  edit() {
    let {title, content, noteId }= this.data.note;
    app.globalData.title = title;
    app.globalData.content = content;
    app.globalData.noteId = noteId;
    wx.switchTab({
      url: '/pages/writenote/writenote',
    });
  },
  onShareAppMessage: function (options) {
    var that = this;
   // 设置菜单中的转发按钮触发转发事件时的转发内容
   var shareObj = {
    title: that.data.note.title,        // 默认是小程序的名称(可以写slogan等)
    path: `/pages/readnote/readnote?noteId=${that.data.note.noteId}`,        // 默认是当前页面，必须是以‘/’开头的完整路径
    imageUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
    success: function (res) {
      // 转发成功之后的回调
      console.log(res);
      if (res.errMsg == 'shareAppMessage:ok') {
        wx.showToast({
          title: '分享成功,继续努力!',
          icon: 'none',
        });
      }
    },
    fail: function (res) {
      console.log(res);
      // 转发失败之后的回调
      if (res.errMsg == 'shareAppMessage:fail cancel') {
        // 用户取消转发
        wx.showToast({
          title: '您取消了分享!',
          icon: 'none',
        });
      } else if (res.errMsg == 'shareAppMessage:fail') {
        // 转发失败，其中 detail message 为详细失败信息
        wx.showToast({
          title: '分享出错了,待会儿再试吧!',
          icon: 'none',
        });
      }
    }
  };
    // 返回shareObj
    return shareObj;
  }
})