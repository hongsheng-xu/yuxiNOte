// pages/login/login.js//获取应用实例
const { request } = require('../../utils/request');
const { pinyin } = require('../../utils/getChina');
const { wxLogin } = require('../../utils/wxApi');

Page({
  data: {
    motto: "一个爱用语析笔记的好学生",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isCheckingInfo: false,
    title: "我的",
    mail: ''
  },
  onShow: function () {
    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      this.setData({
        userInfo,
        hasUserInfo: true,
        mail: userInfo.mail
      })
    }
    //列表初始化
    this.setData({
      isCheckingInfo: false,
      title: "我的"
    })
  },
  async getUserInfo(e) {
    console.log(e);
    var that = this;
    let { userInfo } = e.detail;
    if (e.detail.errMsg != "getUserInfo:fail auth deny") {
      userInfo.province = pinyin(userInfo.province);
      wx.showToast({
        title: '登录中,请稍候...',
        icon: 'none',
      });
      wxLogin()
        .then(result => {
          let code = result.code;
          let { avatarUrl, gender, nickName, province } = userInfo;
          request({
            "url": "/login",
            data: {
              code,
              avatarUrl,
              gender,
              nickName,
              province,
            },
            "method": "POST"
          })
            .then(res => {
              console.log(res);
              if (res.data.code && res.data.code == 200) {
                let { token, userInfo } = res.data.data;
                that.setData({
                  userInfo: userInfo,
                  hasUserInfo: true
                })
                wx.setStorageSync("userInfo", userInfo);
                wx.setStorageSync("token", token);
              } else {
                //显示弹窗服务器获取id出错
                wx.showToast({
                  title: '服务器走丢了...',
                  icon: 'none',
                });
                return;
              }
            })
            .catch(err => {
              console.log(err);
              wx.showToast({
                title: '服务器走丢了...',
                icon: 'none',
              });
              //服务器获取openid失败
            })
        })
        .catch(err => {
          console.log(err);
          wx.showToast({
            title: '服务器走丢了...',
            icon: 'none',
          });
          //显示弹窗.微信获取code失败
          return;
        })
    } else {
      wx.showToast({
        title: '您取消了登录!',
        icon: 'none',
      });
    }
  },
  checkInfo: function () {
    if (this.data.isCheckingInfo) {
      this.setData({
        isCheckingInfo: false,
        title: "我的"
      })
    }
    else {
      if (!this.data.userInfo.avatarUrl) {
        console.log("此处显示弹窗用户未登录");
        return;
      }
      this.setData({
        isCheckingInfo: true,
        title: "个人信息"
      })
    }
  },
  inputMail: function (e) {
    this.setData({
      mail: e.detail.value
    })
  },
  confirmMail: function (e) {
    let userInfo = wx.getStorageSync("userInfo") || "";
    if (userInfo){
      userInfo.mail = e.detail.value;
      wx.setStorageSync("userInfo", userInfo);
    }
  }
})
