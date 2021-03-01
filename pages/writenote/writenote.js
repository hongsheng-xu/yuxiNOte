// 在需要使用的js文件中，导入js
const { formatTime } = require('../../utils/getTime.js');
const { request } = require('../../utils/request');
const { wxUploadFile } = require('../../utils/wxApi');

//获取应用实例
const app = getApp();
var plugin = requirePlugin("WechatSI");
const manager = plugin.getRecordRecognitionManager();

Page({
  data: {
    note: {
      title: '',
      updateTime: '',
      content: ""
    },
    time: '',
    article: {},
    md: false,
    choseFont: false,
    font: '',
    userInfo: {},
    token: "",
    noteId: '',
    opHeight: "",
    currentTranslate: {
      text_CN: "",
      text_US: "",
      voicePath: ""
    },
    isRecord: false,
    FROM: '',
    isDarwing: false
  },
  isChange: false,
  choseImg: false,
  recordId: '',
  onLoad() {
    this.initRecord();
    this.context = wx.createCanvasContext('canvas');
    this.isMouseDown = false
    this.lastLoc = { x: 0, y: 0 }
    this.lastTimestamp = 0;
    this.lastLineWidth = -1;
    this.drawBgColor();
  },
  onShow() {
    if (this.choseImg)
      return;
    console.log(app.globalData);
    var time = formatTime();
    let { noteId, content, title, FROM } = app.globalData;
    if (title.length > 24) {
      title = title.slice(0, 24);
    }
    let note = wx.getStorageSync("note") || {};
    if (noteId || title || content) {
      if (note.content || note.title) {
        wx.showModal({
          title: 'Notice',
          content: '你有一篇暂存笔记,是否保留',
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#000000',
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: (result) => {
            if (result.confirm) {
              noteId = "";
              content = note.content;
              title = note.title;
              this.setData({
                time: time,
                md: false,
                FROM: '',
                noteId: '',
                note: {
                  title,
                  content
                },
              });
            }
          },
        });
      }
      app.globalData.noteId = "";
      app.globalData.title = "";
      app.globalData.content = "";
      app.FROM = '';
    } else {
      noteId = "";
      content = note.content;
      title = note.title;
    }
    // 再通过setData更改Page()里面的data，动态更新页面的数据
    if (content)
      this.render(content);
    this.setData({
      time: time,
      md: false,
      FROM,
      noteId,
      note: {
        title,
        content
      },
      opHeight: ""
    });
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
      token,
    })

  },
  backIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  setNote() {
    wx.setStorageSync("note", this.data.note);
  },
  changeTitle(e) {
    let title = 'note.title';
    this.setData({
      [title]: e.detail.value
    })
    this.setNote();
  },
  render(data) {
    const _ts = this;
    if (!data) {
      data = "> 语析笔记支持MarkDown啦!"
    }
    //将markdown内容转换为towxml数据
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
    _ts.setNote();
  },
  addLine() {
    let { content } = this.data.note;
    this.render(content);
  },
  inputChange(e) {
    console.log(e);
    if (this.isChange == true) {
      console.log(this.isChange);
      return;
    }
    this.isChange = true;
    let content = 'note.content'
    this.setData({
      [content]: e.detail.value,
    })
    this.render(e.detail.value);
    this.isChange = false;
  },
  focustext(e) {
    var curTime = e.timeStamp
    var lastTime = e.currentTarget.dataset.time ;
    if (curTime - lastTime > 0) {
      if (curTime - lastTime < 300) {//是双击事件
        console.log("双击：" + (curTime - lastTime))
      }else{
        this.setData({
          lastTapTime: curTime,
        })
        return;
      }
    }
    this.setData({
      opHeight: e.detail.height + 10 + 'px',
      md: false,
      lastTapTime: curTime,
    })
  },
  blurtext(e) {
    console.log(e);
    this.setData({
      opHeight: '0px',
      md: true
    })
  },
  hideOp() {
    this.setData({
      hideOp: true,
      opHeight: '-120rpx'
    })
    wx.showToast({
      title: '点击标题下方的时间戳即可恢复!',
      icon: 'none',
    });
  },
  showOp() {
    this.setData({
      opHeight: '0'
    })
  },
  choseFont() {
    let that = this;
    this.setData({
      choseFont: !that.data.choseFont,
      md: false
    })
  },
  changeSiaze(e) {
    this.setData({
      md: false
    })
    let that = this;
    let { size } = e.currentTarget.dataset;
    let { content } = this.data.note;
    if (content && content.charCodeAt(content.length - 1) != 10) {
      content += '\n';
    }
    content += '#'.repeat(size) + ' ';
    this.setData({
      choseFont: !that.data.choseFont,
      ['note.content']: content
    })
  },
  //添加上传图片
  chooseImageTap: function () {
    this.setData({
      md: false
    })
    this.choseImg = true;
    var that = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#00000",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.chooseWxImage('album')
          } else if (res.tapIndex == 1) {
            that.chooseWxImage('camera')
          }
        }
      }
    })
  },
  // 图片本地路径
  chooseWxImage: function (type) {
    var that = this;
    var imgsPaths = that.data.imgs;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: function (res) {
        console.log(res.tempFilePaths[0]);
        that.upImgs(res.tempFilePaths[0], 0) //调用上传方法
      }
    })
  },
  //上传服务器
  upImgs: async function (imgurl, index) {
    this.choseImg = false
    var that = this;
    let res = await wxUploadFile({ filePath: imgurl })
    res = JSON.parse(res.data);
    if (res.code == 200) {
      let { content } = that.data.note;
      if (content && content.charCodeAt(content.length - 1) != 10) {
        content += '\n';
      }
      if (!res.data.fileName)
        res.data.fileName = "图片加载失败...";
      content += `![${res.data.fileName}](${res.data.fileUrl})\n`
      console.log(content);
      that.setData({
        ['note.content']: content
      })
    } else {
      wx.showToast({
        title: '图片上传服务器失败,请重试!',
        icon: 'none'
      });
    }
  },
  drawCanvas() {
    wx.showToast({
      title: '点击最上方icon即可关闭!',
      icon: 'none',
    });
    this.setData({
      isDarwing: true
    })
  },
  hideCanvas() {
    this.setData({
      isDarwing: false
    })
  },
  drawBgColor() {
    this.context.save();
    this.context.setFillStyle('#ffffff');
    this.context.strokeRect();
    this.context.restore();
    this.context.draw({
      reserve: true
    })
  },
  beginStroke(event) {
    console.log(event);
    if (this.data.isDarwing == false)
      return;
    this.isMouseDown = true
    this.lastLoc = { x: event.touches[0].x, y: event.touches[0].y }
    this.lastTimestamp = event.timeStamp;
    // //draw
    this.context.arc(this.lastLoc.x, this.lastLoc.y, this.Blod / 2, 0, 2 * Math.PI)
    this.context.setFillStyle(this.colors[this.color]);
    this.context.fill();
    wx.drawCanvas({
      canvasId: 'canvas',
      reserve: true,
      actions: this.context.getActions() // 获取绘图动作数组
    })

    // if (event.touches.length>1){
    //   var xMove = event.touches[1].x - event.touches[0].x;
    //   var yMove = event.touches[1].y - event.touches[0].y;
    //   this.lastDistance = Math.sqrt(xMove * xMove + yMove * yMove);

    // }

  },

  endStroke(event) {
    if (this.data.isDarwing == false)
      return;
    this.lastLoc = { x: event.changedTouches[0].x, y: event.changedTouches[0].y }
    this.lastTimestamp = event.timeStamp;
    //draw
    this.context.arc(this.lastLoc.x, this.lastLoc.y, this.Blod / 2, 0, 2 * Math.PI)
    this.context.setFillStyle(this.colors[this.color]);
    this.context.fill();
    wx.drawCanvas({
      canvasId: 'canvas',
      reserve: true,
      actions: this.context.getActions() // 获取绘图动作数组
    })


    this.isMouseDown = false
  },

  moveStroke(event) {
    if (this.data.isDarwing == false)
      return;
    if (this.isMouseDown && event.touches.length == 1) {
      var touch = event.touches[0];
      var context = this.context;
      var curLoc = { x: touch.x, y: touch.y };
      var curTimestamp = event.timeStamp;
      var s = this.calcDistance(curLoc, this.lastLoc)
      var t = curTimestamp - this.lastTimestamp;
      var lineWidth = this.calcLineWidth(t, s)
      //draw

      context.setStrokeStyle(this.colors[this.color]);
      context.setLineWidth(lineWidth);
      context.beginPath()
      context.moveTo(this.lastLoc.x, this.lastLoc.y)
      context.lineTo(curLoc.x, curLoc.y)

      // locHistory.push({ x: curLoc.x, y: curLoc.y, with: lineWidth, t: t })


      context.setLineCap("round")
      context.setLineJoin("round")
      context.stroke();

      this.lastLoc = curLoc;
      // this.setData({ lastTimestamp: curTimestamp })
      // this.setData({ lastLineWidth: lineWidth })

      wx.drawCanvas({
        canvasId: 'canvas',
        reserve: true,
        actions: this.context.getActions() // 获取绘图动作数组
      })

    } else if (event.touches.length > 1) {
      this.setData({ isTap: false })

      var xMove = event.touches[1].x - event.touches[0].x;
      var yMove = event.touches[1].y - event.touches[0].y;
      var newdistance = Math.sqrt(xMove * xMove + yMove * yMove);
      // if (newdistance - this.lastDistance>0){
      //   this.setData({ canvasWidth: this.data.canvasWidth * 1.2 })
      //   this.setData({ canvasHeight: this.data.canvasHeight * 1.2 })
      // }else{
      //   this.setData({ canvasWidth: this.data.canvasWidth * 0.8 })
      //   this.setData({ canvasHeight: this.data.canvasHeight * 0.8})
      // }

    }
  },
  calcLineWidth(t, s) {
    var v = s / t;
    var resultLineWidth = this.Blod;
    if (v <= 0.1) {
      resultLineWidth = resultLineWidth * 1.2;
    } else if (v >= 10) {
      resultLineWidth = resultLineWidth / 1.2
    } else {
      resultLineWidth = resultLineWidth - (v - 0.1) / (10 - 0.1) * (resultLineWidth * 1.2 - resultLineWidth / 1.2)
    }
    return resultLineWidth
  },
  calcDistance(loc1, loc2) {
    return Math.sqrt((loc1.x - loc2.x) * (loc1.x - loc2.x) + (loc1.y - loc2.y) * (loc1.y - loc2.y))
  },
  clearCanvas: function () {
    this.context.clearRect(0, 0, 720, 900);
    this.drawBgColor();
    wx.showToast({
      title: '已清空!',
      icon: 'none',
    });
  },
  Blod: 2,
  setBlod() {
    this.Blod += 2;
    if (this.Blod >= 12)
      this.Blod = 2;
    wx.showToast({
      title: '当前使用字号: ' + (6 - this.Blod / 2),
      icon: 'none',
    });
  },
  colors: ['black', 'pink', 'red', 'skyblue', 'greenyellow', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF',
    '#FFFF00', '#70DB93', '#5C3317', '#9F5F9F', '#B5A642', '#FF7F00', '#42426F'],
  color: 0,
  setColor() {
    this.color++;
    if (this.color > 15)
      this.color = 0;
    wx.showToast({
      title: '当前使用: ' + this.colors[this.color],
      icon: 'none',
    });
  },
  setImage() {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'canvas',
      fileType: 'png',
      quality: 1, //图片质量
      success(res) {
        console.log(res);
        wx.showModal({
          title: 'Notice',
          content: '是否需要保留墨迹到本地?',
          showCancel: true,
          cancelText: '取消',
          cancelColor: '#000000',
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: (result) => {
            if (result.confirm) {
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success(res) {
                  console.log(res);
                  wx.showToast({
                    title: '已保存到相册',
                    duration: 2000
                  });
                }
              })
            }
          },
          complete: async () => {
            let back = await wxUploadFile({ filePath: res.tempFilePath });
            back = JSON.parse(back.data);
            console.log(back);
            if (back.code == 200) {
              let { content } = that.data.note;
              if (content && content.charCodeAt(content.length - 1) != 10) {
                content += '\n';
              }
              if (!back.data.fileName)
              {  back.data.fileName = "> 墨迹暂时识别不出来喔~";}else{
                back.data.fileName =  `> 墨迹识别: `+ back.data.fileName;
              }
              
              if (!content) {
                content = '';
              }
              content += `![墨迹](${back.data.fileUrl})\n${back.data.fileName}\n`
              console.log(content);
              that.setData({
                ['note.content']: content
              })
            } else {
              wx.showToast({
                title: '墨迹上传失败!',
                icon: 'none',
              });
            }
            that.clearCanvas();
            that.hideCanvas();
          }
        });
      }

    })
  },
  onHide() {
    if (this.choseImg)
      return;
    var that = this;
    let { title, content } = that.data.note;
    if (!title || !content) {
      wx.showToast({
        title: `${title ? '\'' + title + '\'' + ': ' : ''}` + '已暂存!',
        icon: 'none',
      });
      return;
    }
    if (that.data.nodeId && content == app.globalData.content && title == app.globalData.title) {
      that.setData({
        note: {}
      })
      wx.setStorageSync("note", {});
      return;
    }
    let url = ''
    console.log(this.data);
    if (that.data.noteId) { url = '/update-note'; }
    else {
      url = '/create-note';
    }
    console.log(url);
    app.globalData.setdata = true;
    request({
      url: url,
      data: {
        title: title,
        content: content,
        noteId: that.data.noteId,
        FROM: that.data.FROM
      },
      method: "POST"
    }).then(res => {
      console.log(res);
      if (res.data.code == 200) {
        wx.setStorageSync("note", {});
        that.setData({
          noteId: "",
          note: ""
        })
        wx.showToast({
          title: `${title ? '\'' + title + '\'' + ': ' : ''}` + '已保存!',
          icon: 'none',
        });
      } else {
        wx.showToast({
          title: `${title ? '\'' + title + '\'' + ': ' : ''}` + '自动保存失败,下次点击新建页面即可恢复!',
          icon: 'none',
        });
      }
    }).catch(err => {
      wx.showToast({
        title: `${title ? '\'' + title + '\'' + ': ' : ''}` + '自动保存失败,下次点击新建页面即可恢复!',
        icon: 'none',
      });
    })
  },
  streamRecord: function (e) {
    var that = this;
    console.log(e);
    this.setData({
      isRecord: true,
      md: false,
    })
    wx.stopBackgroundAudio();
    wx.showToast({
      title: '开始录音,松开结束!',
      icon: 'none',
    });
    this.recordId = setTimeout(() => {
      wx.showToast({
        title: '录音最大长度为20s',
        icon: 'none',
      });
      that.endRecord();
    }, 20000);
    manager.start({
      lang: 'zh_CN'
    });
  },
  streamRecordEnd: async function (e) {
    this.setData({
      isRecord: false,
      md: false
    })
    if (this.recordId) {
      clearTimeout(this.recordId);
      this.recordId = '';
    }
    console.log(e);
    manager.stop();
  },
  initRecord() {
    console.log("indexinitRecord");
    var that = this
    manager.onRecognize = function (e) {
      console.log(e);
      that.setData({
        ['currentTranslate.text_CN']: e.result
      });
    };
    manager.onStop = function (e) {
      console.log(e.tempFilePath);
      if (e.result) {
        let currentTranslate = Object.assign({}, that.data.currentTranslate, {
          text_CN: e.result,
          voicePath: e.tempFilePath
        });
        that.setData({
          currentTranslate,
        });
        that.translateText(currentTranslate)
          .then(res => {
            wx.showToast({
              title: '正在翻译,请稍后...',
              icon: 'none',
              duration: 1500,
              mask: true,
            });
            console.log(res);
            wxUploadFile({ filePath: that.data.currentTranslate.voicePath })
              .then(res => {
                console.log(res);
                res = JSON.parse(res.data);
                //接口返回网络路径
                if (res.code == 200) {
                  let { content } = that.data.note;
                  if (!content) {
                    content = ""
                  }
                  if (content && content.charCodeAt(content.length - 1) != 10) {
                    content += '\n';
                  }
                  if (!res.data.fileName)
                    res.data.fileName = "录音";
                  content += `<audio preload="auto" name="录音" author="${that.data.userInfo.nickName}" poster="https://s3.ax1x.com/2021/02/22/ybP9qx.png" src="${res.data.fileUrl}"></audio>\n> 文字: ${that.data.currentTranslate.text_CN}\n \n> 翻译: ${that.data.currentTranslate.text_US}\n`
                  console.log(content);
                  that.setData({
                    ['note.content']: content
                  })
                } else {
                  wx.showToast({
                    title: '音频上传服务器失败,请重试!',
                    icon: 'none'
                  });
                }

              })
              .catch(err => {
                wx.showToast({
                  title: err.errMsg,
                  icon: 'none',
                });
              })
          })

      } else {
        wx.showToast({
          title: '录制时间太短了喔!',
          icon: 'none',
        });
      }
    };
    manager.onError = function (e) {
      console.log(e);
    }
    wx.onBackgroundAudioPlay(function (e) {
      console.log(e);
      var a = wx.getBackgroundAudioManager().src;
      t.setData({
        currentTranslateVoice: a
      });
    });
  },
  translateText: function (e) {
    return new Promise((resolve, reject) => {
      console.log("indextranslateText", e);
      var that = this;
      plugin.translate({
        lfrom: "zh_CN",
        lto: "en_US",
        content: e.text_CN,
        tts: true,
        success: function (res) {
          console.log(res);
          if (res.retcode == 0) {
            that.setData({
              ['currentTranslate.text_US']: res.result
            })
            resolve(res)
          } else {
            reject(res)
            wx.showToast({
              title: '翻译失败!',
              icon: 'none',
            });
          };
        },
        fail: function (e) {
          console.log(e);
          wx.showToast({
            title: '同声传译调用失败!',
            icon: 'none',
          });
          reject(e)
        }
      });
    })

  },
})