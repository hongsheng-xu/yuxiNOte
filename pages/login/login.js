// pages/login/login.js//获取应用实例
const app = getApp()
const { pinyin } = require('../../utils/getChina');

Page({
  data: {
    motto: "一个爱用语析笔记的好学生",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isCheckingInfo: false,
    title: "我的"
  },
  onShow: function(){
    this.setData({
      isCheckingInfo: false,
      title: "我的"
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      app.globalData.userInfo.province=pinyin(app.globalData.userInfo.province)
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        res.userInfo.province = pinyin(res.userInfo.province);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          res.userInfo.province = pinyin(res.userInfo.province);
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo;
    app.globalData.userInfo.province=pinyin(app.globalData.userInfo.province)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  checkInfo: function () {
    if(this.data.isCheckingInfo){
      this.setData({
        isCheckingInfo: false,
        title: "我的"
      })
    }
    else{
      this.setData({
        isCheckingInfo: true,
        title: "个人信息"
      })
    }
  }
})
