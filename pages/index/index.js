// pages/index/index.js
const { request } = require('../../utils/request');
const { isLogin, wxUploadFile } = require('../../utils/wxApi')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab切换
    currentTab: 0,
    notesFromMe: [],
    notesFromShare: [],
    notesFromWechat: []
  },
  title: '',
  content: '',
  async onShow() {
    let that = this;
    if (app.globalData.setdata) {
      setTimeout(() => {
        that.queryNotes("ME");
        app.globalData.setdata = false;
      }, 1000);
    }
    //读取本地缓存
    let notesFromMe = wx.getStorageSync("notesFromMe") || [];
    if (notesFromMe) {
      this.setData({
        notesFromMe,
      })
    }
    //初始化数据
    this.queryNotes("ME");
    this.setData({
      currentTab: 0
    })
  },
  onLoad: function () {
  },
  /**
    * 滑动切换tab
    */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  /**
   * 点击tab切换
   */
  swichNav: async function (e) {
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      if (e.target.dataset.current == 0) {
        this.queryNotes("ME")
      }
      if (e.target.dataset.current == 1) {
        this.queryNotes("SHARE")
      }
      if (e.target.dataset.current == 2) {
        this.queryNotes("WECHAT")
      }
      this.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  tapphotoSearch() {
    //点击主页中间拍照搜题
    wx.redirectTo({
      url: '/pages/photosearch/photosearch',
    });
  },
  async deleteNote(e) {
    wx.showModal({
      title: 'Note',
      content: '确定要删除' + e.currentTarget.dataset.title,
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if (result.confirm) {
          let { noteid, type } = e.currentTarget.dataset;
          let notes = wx.getStorageSync("notesFrom" + type) || [];
          var that = this;
          //此处写确认删除的代码
          notes.forEach((value, index, notes) => {
            if (value.noteId == noteid) {
              request({
                url: "/delete-note",
                data: {
                  noteId: noteid
                }
              }).then(res => {
                if (res.data.code == 200) {
                  notes.splice(index, 1);
                  console.log(notes);
                  that.setData({
                    ["notesFrom" + type]: notes,
                  })
                  wx.setStorageSync("notesFrom" + type, notes);
                } else if (res.data.code == 400) {
                  wx.showToast({
                    title: '该条笔记不存在!',
                    icon: 'none',
                  });
                } else {
                  wx.showToast({
                    title: '服务器走丢了...',
                    icon: 'none',
                  });
                }
              }).catch(err => {
                console.log(err);
                wx.showToast({
                  title: '服务器走丢了...',
                  icon: 'none',
                });
              })
            }
          })
        }
      },
    });
  },
  queryNotes: async function (str) {
    let storage = "";
    if (str == "ME")
      storage = "notesFromMe";
    if (str == "SHARE")
      storage = "notesFromShare";
    if (str == "WECHAT")
      storage = "notesFromWechat";
    console.log(storage);
    //当传入参数错误
    if (storage == "")
      return;
    if (isLogin()) {
      let res = await request({
        "url": '/',
        "data": {
          "FROM": str
        }
      })
      console.log(res);
      wx.setStorageSync(storage, res.data.data);
      this.setData({
        [storage]: res.data.data
      })
    }
  },
  onShareAppMessage: function (options) {
    // 设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: "语析笔记",        // 默认是小程序的名称(可以写slogan等)
      path: '/pages/index/index',        // 默认是当前页面，必须是以‘/’开头的完整路径
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
  },
  importFromWechat() {
    wx.showToast({
      title: '仅支持: md/txt/图片/视频!',
      icon: 'none',
    });
    if (!isLogin) {
      wx.switchTab({
        url: '/pages/login/login',
      });
      wx.showToast({
        title: 'q请先登录!',
        icon: 'none',
      });
    }
    var that = this;
    wx.chooseMessageFile({
      count: 1,
      type: 'all',
      async success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFiles[0];
        console.log(tempFilePaths);
        const { name, path, type } = tempFilePaths;
        that.title = name;
        if (type == "file") {
          if (name.endsWith(".txt") || name.endsWith(".md")) {
            var f = wx.getFileSystemManager()
            if (name.endsWith(".txt")) {
              that.title = that.title.slice(0, that.title.lastIndexOf(".txt"));
            }
            if (name.endsWith(".md")) {
              that.title = that.title.slice(0, that.title.lastIndexOf(".md"));
            }
            that.content = f.readFileSync(path, 'utf-8')
          } else {
            wx.showToast({
              title: '不支持: word/excel/ppt!',
              icon: 'none',
            });
          }
        } else if (type == "image") {
          let res = await wxUploadFile({ filePath: path })
          res = JSON.parse(res.data);
          if (res.code == 200) {
            if (!res.data.fileName) { res.data.fileName = "图片加载失败..."; }
            that.content = `![${res.data.fileName}](${res.data.fileUrl})\n`
            console.log(that.content);
          } else {
            wx.showToast({
              title: '图片上传服务器失败,请重试!',
              icon: 'none'
            });
          }
        } else if (type == "video") {
          let res = await wxUploadFile({ filePath: path })
          res = JSON.parse(res.data);
          console.log(res);
          if (res.code == 200) {
            if (!res.data.fileName)
              res.data.fileName = "微信视频";
            that.content = `<video src="${res.data.fileUrl}" poster="https://s3.ax1x.com/2021/02/22/ybP9qx.png" preload="auto"></video>\n`
          } else {
            wx.showToast({
              title: '视频上传服务器失败,请重试!',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: '暂不支持该文件类型!',
            icon: 'none',
          });
        }
        if(that.content=="")
          that.content= "> 获取文件内容: fail!"
        app.globalData.title = that.title;
        app.globalData.content = that.content;
        app.globalData.FROM = "WECHAT";
        wx.switchTab({
          url: '/pages/writenote/writenote',
        });
      },
    })
  }
})




