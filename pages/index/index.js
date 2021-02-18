// pages/index/index.js
const { request } = require('../../utils/request');
const { isLogin } = require('../../utils/wxApi')
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    y: 999,
    winWidth: 0,
    winHeight: 0,
    // tab切换
    currentTab: 0,
    notesFromMe: {}
  },
  onShow() {
    //如果登录才发送请求
    if (isLogin()) {
      request({
        "url": '/',
        "data": {
          "FROM": "ME"
        }
      }).then(res => {
        console.log(res);
        wx.setStorageSync("notesFromMe", res.data.data);
      }).catch(err => {
        console.log(err);
        wx.showToast({
          title: '服务器走丢了...'
        });
      })
    }
    //读取本地缓存
    let notesFromMe = wx.getStorageSync("notesFromMe") || {};
    if(notesFromMe){
      this.setData({
        notesFromMe,
      })
    }
    //初始化数据
    this.setData({
      currentTab: 0,
    })
  },
  onLoad: function () {
    var that = this;
    /**
     * 获取系统信息
     */
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
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
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  dianji: function () {
    console.log("1");
  },
  tapphotoSearch() {
    //点击主页中间拍照搜题
    wx.redirectTo({
      url: '/pages/photosearch/photosearch',
    });
  },
})




