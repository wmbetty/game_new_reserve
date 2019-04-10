// pages/activityList/activityList.js 活动列表页
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();

Page({
  data: {
    nvabarData: {
      title: '热门活动',
      showCapsule: 1,
      isActivityIn: true
    },
    height: 0,
    token: '',
    type: 1,
    activitys: [],
    showEmpty: false,
    page1: 1,
    page2: 1,
    showDialog: false
  },
  onLoad: function (options) {
    let that = this;
    if (options.isBox) {
      wx.navigateTo({
        url: `/pages/boxes/boxes?activityId=${options.activityId}&isShareIn=1&encryptId=${options.encryptId}`
      })
    }
    fun.wxLogin().then((res)=>{
      if (res) {
        let token = res;
        that.setData({token: token});
        let activityListApi = backApi.activityListApi+token;
        fun.quest(activityListApi, 'GET', {page: that.data.page1}, (res)=>{
          if (res) {
            let datas = res;
            that.setData({activitys: res});
          }
        })
      } else {
        Api.wxShowToast('微信登录失败~', 'none', 2000);
      }
    })
    let gzCode = options.code;
    if (gzCode) {
      wx.setStorageSync('gzCode', gzCode);
    }
  },
  onReady: function () {},
  onShow: function () {
    let that = this;
    let height = app.globalData.height;
    that.setData({height: height});
    app.aldstat.sendEvent(`进入活动列表页面`,{
      play : ""
    });
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo.id) {
      that.setData({showDialog: true})
    }
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let pdata = that.data;
    let activitys = pdata.activitys;
    let activityListApi = backApi.activityListApi+pdata.token;
    let activityParticipateApi = backApi.activityParticipateApi+pdata.token;
    let type = pdata.type;
    let page1 = pdata.page1*1+1;
    let page2 = pdata.page2*1+1;
    wx.showLoading({title: '加载中~'});
    if (type*1===1) {
      fun.quest(activityListApi, 'GET', {page: page1}, (res)=>{
        if (res && res.length) {
          wx.hideLoading();
          app.aldstat.sendEvent(`活动列表页最新活动上滑加载更多`,{
            play : ""
          });
          let datas = res;
          activitys = activitys.concat(datas);
          that.setData({activitys: activitys, page1: page1});
        } else {
          wx.hideLoading();
          Api.wxShowToast('没有更多了~', 'none', 2000);
        }
      })
    } else {
      app.aldstat.sendEvent(`活动列表页参与记录上滑加载更多`,{
        play : ""
      });
      fun.quest(activityParticipateApi, 'GET', {page: page2}, (res)=>{
        if (res) {
          wx.hideLoading();
          let datas = res;
          if (datas.length===0) {
            Api.wxShowToast('没有更多参与记录了~', 'none', 2000);
          } else {
            activitys = activitys.concat(datas);
            that.setData({activitys: activitys, page2: page2});
          }
        } else {
          wx.hideLoading();
        }
      })
    }
  },
  onShareAppMessage: function () {
    app.aldstat.sendEvent(`分享活动列表页`,{
      play : ""
    });
    return {
        path: `/pages/index/index?isActList=1`
      }
  },
  changeTab (e) {
    let that = this;
    let pageData = that.data;
    let type = e.currentTarget.dataset.type;
    that.setData({type: type, activitys: [], page1: 1, page2: 1})
    let activityListApi = backApi.activityListApi+pageData.token;
    let activityParticipateApi = backApi.activityParticipateApi+pageData.token;
    if (type*1===1) {
      fun.quest(activityListApi, 'GET', {}, (res)=>{
        if (res) {
          let datas = res;
          if (datas.length===0) {
            that.setData({showEmpty: true})
          } else {
            that.setData({activitys: res, showEmpty: false});
          }
        }
      })
      app.aldstat.sendEvent(`活动列表页点击最新活动`,{
        play : ""
      });
    } else {
      fun.quest(activityParticipateApi, 'GET', {}, (res)=>{
        if (res) {
          let datas = res;
          if (datas.length===0) {
            that.setData({showEmpty: true})
          } else {
            that.setData({activitys: res, showEmpty: false});
          }
        }
      })
      app.aldstat.sendEvent(`活动列表页点击参与记录`,{
        play : ""
      });
    }
  },
  goReserve (e) {
    let dataset = e.currentTarget.dataset;
    let item = dataset.item;
    let activityId = item.id;
    let state = item.state;
    let name = item.name;
    let typeSign = item.type_sign;
    app.aldstat.sendEvent(`活动列表页点击-${name}-活动`,{
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
