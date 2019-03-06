
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();

Page({
  data: {
    nvabarData: {
      title: '攻略',
      showCapsule: 0
    },
    height: 0,
    isVideo: false,
    token: '',
    games: [],
    lists: [],
    singleGame: {},
    showDialog: false,
    gameAreas: []
  },
  onLoad: function (options) {

  },
  onReady: function () {},
  onShow: function () {
    let that = this;
    let height = app.globalData.height;
    that.setData({height: height});
    app.aldstat.sendEvent(`进入攻略页面`,{
      play : ""
    });
    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        fun.quest(loginApi, 'POST', {code: code}, (res)=>{
          if (res) {
            let token = res.access_token;
            that.setData({token: token});
            let gameListApi = backApi.gameListApi+token;
            let strategyApi = backApi.strategyApi+token;
            let strategyNewestApi = backApi.strategyNewestApi+token;
            wx.showLoading();
            fun.quest(gameListApi,'GET',{},(res)=>{
              if (res) {
                wx.hideLoading();
                that.setData({games: res});
              } else {
                wx.hideLoading();
              }
            })
            fun.quest(strategyApi,'GET',{},(res)=>{
              if (res) {
                let datas = res;
                if (datas.length>0) {
                  for (let item of datas) {
                    item.created_time = item.created_time.substring(0, 10);
                    that.setData({lists: datas});
                  }
                } else {
                  Api.wxShowToast('暂无攻略数据~', 'none', 2000);
                }
              }
            })
            fun.quest(strategyNewestApi,'GET',{},(res)=>{
              if (res) {
                let gameDatas = res;
                that.setData({gameAreas: gameDatas})
              }
            })
          }
        })
      }
    })
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    app.aldstat.sendEvent(`分享攻略页面`,{
      play : ""
    });
    return {
        path: `/pages/tips/tips`
      }
  },
  gotoGame (e) {
    let id = e.currentTarget.dataset.id;
    app.aldstat.sendEvent(`攻略页面进入游戏专区，当前游戏id为${id}`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/singleGame/singleGame?id=${id}`
    })
  },
  goTipDetail (e) {
    let id = e.currentTarget.dataset.id;
    app.aldstat.sendEvent(`攻略页面进入攻略详情页面，当前攻略id为${id}`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/tipDetails/tipDetails?id=${id}`
    })
  },
  goPublish () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      app.aldstat.sendEvent(`攻略页面点击发布按钮`,{
        play : ""
      });
      wx.navigateTo({
        url: `/pages/publish/publish`
      })
    } else {
      that.setData({showDialog:true})
    }
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
            fun.quest(updateUserInfoApi,'POST',userData,(res)=> {
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
