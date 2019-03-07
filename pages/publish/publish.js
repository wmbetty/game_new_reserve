// pages/publish/publish.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();

Page({
  data: {
    nvabarData: {
      title: '发布话题',
      showCapsule: 1
    },
    height: 0,
    showTextarea: false,
    contents: {
      conts: []
    },
    gameId: '',
    gameName: '',
    areaText: '',
    showTips: true,
    canPublish: false,
    titleVal: '',
    token: '',
    listIdx: '',
    showImgOpt: false,
    currImg: '',
    showMask: true,
    showPoster: false,
    showDialog: false,
    openType: 'openSetting',
    authInfo: '需要获取相册权限才能保存图片哦',
    areaFocus: true
  },
  onLoad: function (options) {
    let that = this;

    fun.wxLogin().then((res)=>{
      if (res) {
        let token = res;
        that.setData({token: token});
        let gameListApi = backApi.gameListApi+token;
        fun.quest(gameListApi,'GET',{},(res)=>{
          if (res) {
            that.setData({gameLists: res});
          }
        })
      } else {
        Api.wxShowToast('微信登录失败~', 'none', 2000);
      }
    })

  },
  onReady: function () {},
  onShow: function () {
    let that = this;
    let height = app.globalData.height;
    let winHeight = app.globalData.winHeight;
    that.setData({height: height, winHeight: winHeight});
    app.aldstat.sendEvent(`进入发布攻略页面`,{
      play : ""
    });
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    let that = this;
    let pdata = that.data;
    setTimeout(()=>{
      that.setData({showPoster: false});
      app.aldstat.sendEvent(`攻略发布完成后分享`,{
        play : ""
      });
      wx.switchTab({
        url: '/pages/my/my'
      })
    },1200)
    return {
      title: pdata.shareTitle,
      path: `/pages/index/index?tipId=${pdata.tipId}`,
      imageUrl: `${pdata.shareImg}`
    }
  },
  showTextarea () {
    this.setData({showTextarea: true, showTips: false})
  },
  textFocus () {
    this.setData({showTips: false})
  },
  textBlur (e) {
    let that = this;
    let val = e.detail.value;
    let pdata = that.data;
    let content = pdata.contents;
    let conts = content.conts;
    let titleVal = pdata.titleVal;

    if (val==='') {
      this.setData({showTextarea: false, showTips: true})
    } else {
      let textItem = {
        type: 1, text: val
      }
      if (conts.length===0) {
        conts.unshift(textItem);
        content.conts = conts;
        that.setData({contents: content,showTips: true, showTextarea: false})
      } else {
        conts.push(textItem);
        content.conts = conts;
        that.setData({contents: content,showTips: true, showTextarea: false})
      }
      if (titleVal!=='') {
        that.setData({canPublish: true})
      }
    }

  },
  // inputDone (e) {
  //   let that = this;
  //   let val = e.detail.value;
  //   if (val!=='')
  // },
  chooseImg () {
    let that = this;
    let pdata = that.data;
    let areaText = pdata.areaText;
    let content = pdata.contents;
    let conts = content.conts;
    let titleVal = pdata.titleVal;
    let uploadImgApi = backApi.uploadImgApi+pdata.token;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success (res) {
        const src = res.tempFilePaths[0];
        wx.showLoading();
        wx.uploadFile({
            url: uploadImgApi,
            filePath: src,
            name: 'imageFile',
            formData:{},
            success: function(res){
              wx.hideLoading();
              let data = JSON.parse(res.data);
              let status = data.status*1;
              if (status===200) {
                let img = data.data.file_url
                let imgItem = {
                  type: 2, img_url: img
                }
                if (conts.length===0) {
                  conts.unshift(imgItem);
                  content.conts = conts;
                  that.setData({contents: content})
                } else {
                  conts.push(imgItem);
                  content.conts = conts;
                  that.setData({contents: content})
                }
                if (titleVal!=='') {
                  this.setData({canPublish: true})
                }
              } else {
                Api.wxShowToast('图片上传失败~', 'none', 1400)
              }
            }
          })
      }
    })
  },
  artTextBlur (e) {
    let that = this;
    let content = that.data.contents;
    let conts = content.conts;
    let idx = e.currentTarget.dataset.idx;
    conts[idx].text =e.detail.value;
    content.conts = conts;
    that.setData({contents: content, showTips: true})
    if (conts.length===0) {
      that.setData({canPublish: false});
    }

  },
  titleBlur (e) {
    let that = this;
    let content = that.data.contents;
    let conts = content.conts;
    let titleVal = e.detail.value;
    that.setData({titleVal: titleVal});
    if (titleVal !== '' && conts.length>0) {
      that.setData({canPublish: true});
    } else {
      that.setData({canPublish: false});
    }
  },
  imgOperate (e) {
    let that = this;
    let idx = e.currentTarget.dataset.idx;
    let content = that.data.contents;
    let conts = content.conts;
    that.setData({listIdx: idx, showImgOpt: true, currImg: conts[idx].img_url})
  },
  chooseImgAgain () {
    let that = this;
    let pdata = that.data;
    let listIdx = pdata.listIdx;
    let content = pdata.contents;
    let conts = content.conts;
    let uploadImgApi = backApi.uploadImgApi+pdata.token;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success (res) {
        const src = res.tempFilePaths[0];
        wx.showLoading();
        wx.uploadFile({
            url: uploadImgApi,
            filePath: src,
            name: 'imageFile',
            formData:{},
            success: function(res){
              wx.hideLoading();
              let data = JSON.parse(res.data);
              let status = data.status*1;
              if (status===200) {
                let img = data.data.file_url;
                conts[listIdx].img_url = img;
                content.conts = conts;
                that.setData({contents: content, showImgOpt: false})
              } else {
                Api.wxShowToast('图片上传失败~', 'none', 1400)
              }
            }
          })
      }
    })
  },
  deleteImg () {
    let that = this;
    let listIdx = that.data.listIdx;
    let content = that.data.contents;
    let conts = content.conts;
    Api.wxShowModal('提示','是否删除该图片？',true,(res)=>{
      if (res.confirm) {
        conts.splice(listIdx, 1);
        content.conts = conts;
        that.setData({contents: content, showImgOpt: false})
      } else {}
    })

  },
  goPublish () {
    let that = this;
    let pageData = that.data;
    let content = pageData.contents;
    let conts = content.conts;
    let publishApi = backApi.allStrategyApi+pageData.token;
    wx.showLoading();
    that.setData({canPublish: false});
    fun.quest(publishApi,'POST',{game_id: pageData.gameId,content: conts, title: pageData.titleVal}, (res)=>{
      if (res) {
        wx.hideLoading();
        app.aldstat.sendEvent(`完成发布内容`,{
          play : ""
        });
        content.conts = [];
        that.setData({
          titleVal: '',contents: content, showImgOpt: false,shareTitle: res.title,
          showPoster: true, posterImg: res.share_url, shareImg: res.friend_url,tipId: res.id
        });
      } else {
        wx.hideLoading();
      }
    })
  },
  cancelImg () {
    this.setData({showImgOpt: false})
  },
  chooseGame (e) {
    let that = this;
    let dataset = e.currentTarget.dataset;
    let id = dataset.id;
    let name = dataset.name;
    that.setData({gameId: id, gameName: name, showMask: false, titleFocus: true})
  },
  savePoster () {
    let that = this;
    let poster=that.data.posterImg;
    wx.showToast({
      title: '保存中...',
      icon: 'loading',
      duration: 3300
    });
    app.aldstat.sendEvent(`发布完成保存海报`,{
      play : ""
    });
    setTimeout(()=>{
      wx.downloadFile({
        url: poster,
        success:function(res){
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function (res) {
              Api.wxShowToast('保存成功~', 'none', 2000);
            },
            fail: function (err) {
              that.setData({showDialog:true})
            }
          })
        },
        fail:function(){
          console.log('fail')
        }
      })
    },3300)
  },
  cancelDialog () {
    this.setData({showDialog:false})
  },
  confirmDialog () {
    wx.openSetting({
      success(settingdata) {
        if (settingdata.authSetting["scope.writePhotosAlbum"]) {
          Api.wxShowToast("获取权限成功，再次点击保存到相册",'none',2200)
        } else {
          Api.wxShowToast("获取权限失败",'none',2200)
        }
      }
    })
  },
  hideMask () {
    wx.navigateBack();
  }
})
