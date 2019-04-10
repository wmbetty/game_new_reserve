//index.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    autoplay: true,
    duration: 500,
    interval: 3000,
    circular: true,
    nvabarData: {
      title: '',
      showCapsule: 0,
      showLogo: true
    },
    height: 0,
    rollData: [],
    token: '',
    banners: [],
    games: [],
    activitys: []
  },
  onLoad: function (options) {
    let that = this;
    if (options.tipId) {
      wx.navigateTo({
        url: `/pages/tipDetails/tipDetails?id=${options.tipId}`
      })
    }
    if (options.gameId) {
      wx.navigateTo({
        url: `/pages/singleGame/singleGame?id=${options.gameId}`
      })
    }
    if (options.introGameId) {
      wx.navigateTo({
        url: `/pages/gmintro/gmintro?id=${options.introGameId}`
      })
    }
    if (options.newsId) {
      wx.navigateTo({
        url: `/pages/notedetails/notedetails?id=${options.newsId}`
      })
    }
    if (options.activityId && options.reserveMode) {
      wx.navigateTo({
        url: `/pages/reserveGame/reserveGame?activityId=${options.activityId}`
      })
    }
    if (options.activityId && options.mode) {
      wx.navigateTo({
        url: `/pages/reserveGames/reserveGames?activityId=${options.activityId}`
      })
    }
    if (options.encryptId && options.reserveMode) {
      wx.setStorageSync('encryptId', options.encryptId);
      wx.navigateTo({
        url: `/pages/reserveGame/reserveGame?activityId=${options.activityId}`
      })
    }
    if (options.encryptId && !options.reserveMode) {
      wx.setStorageSync('encryptId', options.encryptId);
      wx.navigateTo({
        url: `/pages/reserveGames/reserveGames?activityId=${options.activityId}`
      })
    }
    if (options.isActList) {
      wx.navigateTo({
        url: `/pages/activityList/activityList`
      })
    }
    fun.wxLogin().then((res)=>{
      if (res) {
        let token = res;
        that.setData({token: token});
        let bannerApi = backApi.bannerApi+token;
        let newestApi = backApi.newestApi+token;
        let activityRecommendApi = backApi.activityRecommendApi+token;
        let gameListApi = backApi.gameListApi+token;
        fun.quest(bannerApi,'GET',{},(res)=>{
          if (res) {
            that.setData({banners: res});
          }
        })
        fun.quest(newestApi,'GET',{},(res)=>{
          if (res) {
            that.setData({rollData: res});
          }
        })
        fun.quest(activityRecommendApi,'GET',{},(res)=>{
          if (res) {
            that.setData({activitys: res});
          }
        })
        wx.showLoading();
        fun.quest(gameListApi,'GET',{},(res)=>{
          if (res) {
            wx.hideLoading();
            that.setData({games: res});
          } else {
            wx.hideLoading();
          }
        })
      } else {
        Api.wxShowToast('微信登录失败~', 'none', 2000);
      }
    })
  },
  onShow () {
    let that = this;
    let height = app.globalData.height;
    that.setData({height: height});
    app.aldstat.sendEvent(`进入首页`,{
      play : ""
    });
  },
  goNotices () {
    wx.navigateTo({
      url: `/pages/notices/notices`
    })
  },
  goGameIntro (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/gmintro/gmintro?id=${id}`
    })
  },
  goBanner (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let banners = that.data.banners;
    let url = banners[index].link_url;
    if (url) {
      if (url==='/pages/tips/tips') {
        wx.switchTab({
          url: url
        })
      } else {
        wx.navigateTo({
          url: url
        })
      }
      app.aldstat.sendEvent(`首页点击第${index*1+1}张banner图`,{
        play : ""
      });
    }
  },
  onShareAppMessage: function () {
    app.aldstat.sendEvent(`首页分享小程序`,{
      play : ""
    });
  },
  goActivityList () {
    app.aldstat.sendEvent(`首页点击更多活动`,{
      play : ""
    });
    wx.navigateTo({
      url: '/pages/activityList/activityList'
    })
  },
  goReserve (e) {
    let dataset = e.currentTarget.dataset;
    let item = dataset.item;
    let activityId = item.id;
    let state = item.state;
    let name = item.name;
    let typeSign = item.type_sign;
    app.aldstat.sendEvent(`首页点击-${name}-活动`,{
      play : ""
    });
    if (state*1===2) {
      Api.wxShowToast('该活动已结束~', 'none', 2000);
    } else {
      if (typeSign==='booking_1') {
        wx.navigateTo({
          url: '/pages/reserveGame/reserveGame?activityId='+activityId
        })
      }
      if (typeSign==='booking_2') {
        wx.navigateTo({
          url: '/pages/reserveGames/reserveGames?activityId='+activityId
        })
      }
      if (typeSign==='extension_1') {
        wx.navigateTo({
          url: '/pages/boxes/boxes?activityId='+activityId
        })
      }
    }
  }
})
