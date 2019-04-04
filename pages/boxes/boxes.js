// pages/boxes/boxes.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();

Page({
  data: {
    showClipboard: false,
    showMask: false,
    showGift: false,
    showNoGift: false,
    showNomoreKeys: false,
    showInviteTips: false,
    showGiveKeys: false,
    nvabarData: {
      title: '',
      showCapsule: 1,
      noBgColor: true,
      backIsCircle: true
    },
    nvabarData1: {
      title: '',
      showCapsule: 1,
      noBgColor: true,
      backIsCircle: true,
      isQrcodeIn: true
    },
    isQrcodeIn: false,
    showDialog: false,
    authInfo: '微信授权才能操作哦',
    height: 0,
    winHeight: 0,
    imgUrls: [
      'https://images.unsplash.com/photo-1551334787-21e6bd3ab135?w=640',
      'https://images.unsplash.com/photo-1551214012-84f95e060dee?w=640',
      'https://images.unsplash.com/photo-1551446591-142875a901a1?w=640'
    ],
    interval: 3000,
    autoplay: true
  },
  onLoad: function (options) {
  },
  onReady: function () {

  },
  onShow: function () {
    let that = this;
    let height = app.globalData.height;
    let winHeight = app.globalData.screenHeight;
    that.setData({height: height, winHeight: winHeight});
  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
  onShareAppMessage: function () {

  },
  // 点击下载游戏按钮
  downloadGame () {
    let that = this;
    let gameUrl = 'https://baidu.com';
    wx.setClipboardData({
       data: gameUrl,
       success: function(res) {
         setTimeout(()=>{
           that.setData({showClipboard: true, showMask: true})
         }, 2100)
       }
     })
   },
   goTakeGift () {
     let that = this;
     that.setData({showInviteTips: false, showMask: false})
   },
   hideDialog () {
     let that = this;
     that.setData({
       showNoGift: false, showMask: false, showInviteTips: false,
       showGift: false, showGiveKeys: false, showNoGift: false, showClipboard: false
     })
   },
   cancelDialog () {
     this.setData({showDialog:false})
   },
   confirmDialog (e) {
     let that = this;
     let updateUserInfoApi = backApi.updateUserInfoApi+that.data.token;
     that.setData({
       showDialog: false
     });
     wx.login({
       success: function (res) {
         let code = res.code;
         wx.getUserInfo({
           success: (res)=>{
             let userData = {
               encryptedData: res.encryptedData,
               iv: res.iv,
               code: code
             }
             fun.quest(updateUserInfoApi, 'POST', userData, (res)=>{
               if (res) {
                 wx.setStorageSync('userInfo', res);
                 Api.wxShowToast('授权成功，可以进行更多操作了', 'none', 2000);
               }
             })
           }
         })
       }
     })
   }
})
