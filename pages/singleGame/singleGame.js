// pages/singleGame/singleGame.js 某个游戏专区
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();

Page({
  data: {
    nvabarData: {
      title: '',
      showCapsule: 1
    },
    height: 0,
    gameId: '',
    token: '',
    lists: [],
    type: 3,
    games: {},
    page: 1
  },
  onLoad: function (options) {
    let that = this;
    that.setData({gameId: options.id});
    app.aldstat.sendEvent(`进入某个游戏攻略页面，当前游戏id为${options.id}`,{
      play : ""
    });
    fun.wxLogin().then((res)=>{
      if (res) {
        let token = res;
        that.setData({token: token});
        let gameDetailApi = backApi.gameDetailApi+ options.id;
        wx.showLoading();
        let allStrategyApi = backApi.allStrategyApi+token;
        fun.quest(allStrategyApi,'GET',{game_id: options.id,type_id: 3, page: 1},(res)=>{
          if (res) {
            wx.hideLoading();
            let datas = res;
            that.setData({types: datas.type.reverse()})
            if (datas.data.length>0) {
              for (let item of datas.data) {
                item.created_time = item.created_time.substring(0, 10);
                that.setData({lists: datas.data, showEmpty: false});
              }
            } else {
              wx.hideLoading();
              that.setData({showEmpty: true});
            }
          } else {
            wx.hideLoading();
          }
        })
        fun.quest(gameDetailApi,'GET',{'access-token':token},(res)=>{
          if (res) {
            that.setData({games: res});
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
    that.setData({height: height})
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let pageData = that.data;
    let type = pageData.type;
    let page = pageData.page*1+1;
    let allStrategyApi = backApi.allStrategyApi+pageData.token;
    let lists = pageData.lists;
    wx.showLoading();
    app.aldstat.sendEvent(`某个游戏攻略页面下拉查看，当前游戏id为${pageData.gameId}`,{
      play : ""
    });
    fun.quest(allStrategyApi,'GET',{game_id: pageData.gameId,type_id: type, page: page},(res)=>{
      if (res) {
        wx.hideLoading();
        let datas = res;
        that.setData({page: page});
        if (datas.data.length>0) {
          for (let item of datas.data) {
            item.created_time = item.created_time.substring(0, 10);
          }
          lists = lists.concat(datas.data);
          that.setData({lists: lists});
        } else {
          Api.wxShowToast('没有更多了~', 'none', 2000);
        }
      } else {
        wx.hideLoading();
      }
    })
  },
  onShareAppMessage: function () {
    let that = this;
    let gameId = that.data.gameId;
    app.aldstat.sendEvent(`分享某个游戏攻略页面，当前游戏id为${gameId}`,{
      play : ""
    });
    return {
        path: `/pages/index/index?gameId=${gameId}`
      }
  },
  goBack () {
    wx.navigateBack()
  },
  changeTab (e) {
    let type = e.currentTarget.dataset.type;
    let that = this;
    let pdata = that.data;
    that.setData({type: type, lists: []})
    let allStrategyApi = backApi.allStrategyApi+pdata.token;
    wx.showLoading();
    fun.quest(allStrategyApi,'GET',{game_id: pdata.gameId,type_id: type, page: 1},(res)=>{
      if (res) {
        wx.hideLoading();
        let datas = res;
        that.setData({page: 1});
        if (datas.data.length>0) {
          for (let item of datas.data) {
            item.created_time = item.created_time.substring(0, 10);
            that.setData({lists: datas.data, showEmpty: false});
          }
        } else {
          wx.hideLoading();
          that.setData({showEmpty: true})
        }
      } else {
        wx.hideLoading();
      }
    })
  },
  goTipDetail (e) {
    let id = e.currentTarget.dataset.id;
    app.aldstat.sendEvent(`某个游戏攻略页面查看某个攻略详情，当前游戏id为${this.data.gameId}，当前攻略为${id}`,{
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
      app.aldstat.sendEvent(`某个游戏攻略页面点击发布按钮，当前游戏id为${that.data.gameId}`,{
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
