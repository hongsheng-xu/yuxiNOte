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
        hasUserInfo: true
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
    userInfo.province = pinyin(userInfo.province);
    if (e.detail.errMsg != "getUserInfo:fail auth deny") {
      wxLogin()
        .then(result => {
          let data = {};
          data.code = result.code;
          data.avatarUrl = userInfo.avatarUrl;
          data.gender = userInfo.gender;
          data.nickName = userInfo.nickName;
          data.province = userInfo.province;
          console.log(data);
          request({
            "url": "/login",
            data,
            "method": "POST"
          })
            .then(res => {
              console.log(res);
              if (res.data.code && res.data.code == 200) {
                that.setData({
                  userInfo: res.data.userInfo,
                  hasUserInfo: true
                })
                wx.setStorageSync("userInfo", userInfo);
                wx.setStorageSync("token", res.data.token)
              } else {
                //显示弹窗服务器获取id出错
                console.log("显示弹窗服务器获取id出错");
                return;
              }
            })
            .catch(err=>{
              console.log(err);
              //服务器获取openid失败
            })
        })
        .catch(err => {
          console.log(err);
          //显示弹窗.微信获取code失败
          return;
        })
    } else {
      console.log("此处展示弹窗用户拒绝授权");
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
})
