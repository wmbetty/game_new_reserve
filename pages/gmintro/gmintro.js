// pages/gmintro/gmintro.js 游戏介绍
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
    token: '',
    gameId: '',
    games: {},
    roles: []
  },
  onLoad: function (options) {
    let that = this;
    that.setData({gameId: options.id});
    app.aldstat.sendEvent(`进入游戏介绍页面，当前游戏id为${options.id}`,{
      play : ""
    });

    fun.wxLogin().then((res)=>{
      if (res) {
        let token = res;
        that.setData({token: token});
        let gameDetailApi = backApi.gameDetailApi+options.id;
        let gameRolesApi = backApi.gameRolesApi+token;
        fun.quest(gameDetailApi,'GET',{'access-token': token}, (res)=>{
          if (res) {
            let nvabarData = {
              title: res.name, showCapsule: 1
            }
            that.setData({games: res, nvabarData: nvabarData});
          }
        })
        fun.quest(gameRolesApi,'GET',{game_id: options.id}, (res)=>{
          if (res) {
            let datas = res;
            if (datas.length===0) {
              that.setData({showEmpty: true})
            } else {
              that.setData({roles: datas, showEmpty: false});
            }
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
    that.setData({height: height});
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    let that = this;
    let gameId = that.data.gameId;
    return {
      title: that.data.games.name,
        path: `/pages/index/index?introGameId=${gameId}`
      }
  }
})
