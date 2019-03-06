// pages/notices/notices.js 公告通知列表
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();

Page({
  data: {
    nvabarData: {
      title: '公告通知',
      showCapsule: 1
    },
    height: 0,
    token: '',
    games: [],
    news: [],
    newsId: '',
    gameId: '',
    page: 1
  },
  onLoad: function (options) {
    let that = this;
    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            that.setData({token: token});
            let gameListApi = backApi.gameListApi+token;
            let newsListApi = backApi.newsListApi+token;
            wx.showLoading();
            fun.quest(gameListApi,'GET',{},(res)=>{
              if (res) {
                wx.hideLoading();
                let datas = res;
                for (let item of datas) {
                  if (item.name.length>4) {
                    item.name = item.name.substring(0,4)+'...';
                  }
                }
                that.setData({games: datas});
              } else {
                wx.hideLoading();
              }
            })
            fun.quest(newsListApi,'GET',{page: 1},(res)=>{
              if (res) {
                let datas = res;
                that.setData({page: 1});
                for (let item of datas) {
                  item.created_time = item.created_time.substring(0, 10);
                  that.setData({news: datas});
                }
              }
            })
          } else {
            console.log('token获取失败')
          }
        })
      }
    })
  },
  onReady: function () {},
  onShow: function () {
    let that = this;
    let height = app.globalData.height;
    that.setData({height: height});
    app.aldstat.sendEvent(`进入公告列表页面`,{
      play : ""
    });
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let gameId = that.data.changeTab;
    let page = that.data.page*1+1;
    let news = that.data.news;
    wx.showLoading();
    app.aldstat.sendEvent(`公告列表页下拉查看`,{
      play : ""
    });
    let newsListApi = backApi.newsListApi+that.data.token;
    fun.quest(newsListApi,'GET',{game_id: gameId, page: page},(res)=>{
      if (res) {
        wx.hideLoading();
        let datas = res;
        that.setData({page: page});
        if (datas.length===0) {
          Api.wxShowToast('没有更多了~', 'none', 2000);
        } else {
          for (let item of datas) {
            item.created_time = item.created_time.substring(0, 10);
          }
          news = news.concat(datas);
          that.setData({news: news});
        }
      } else {
        wx.hideLoading();
      }
    })
  },
  onShareAppMessage: function () {
    return {
        path: `/pages/index/index`
      }
  },
  goNewsDetail (e) {
    let id = e.currentTarget.dataset.id;
    app.aldstat.sendEvent(`公告列表页查看详情，当前公告id为${id}`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/notedetails/notedetails?id=${id}`
    })
  },
  changeTab (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    that.setData({gameId: id, news: []});
    app.aldstat.sendEvent(`公告列表页查看某个游戏所有公告，当前游戏id为${id}`,{
      play : ""
    });
    wx.showLoading();
    let newsListApi = backApi.newsListApi+that.data.token;
    fun.quest(newsListApi,'GET',{game_id: id, page: 1},(res)=>{
      if (res) {
        wx.hideLoading();
        let datas = res;
        that.setData({page: 1});
        if (datas.length===0) {
          that.setData({showEmpty: true})
        } else {
          for (let item of datas) {
            item.created_time = item.created_time.substring(0, 10);
            that.setData({news: datas, showEmpty: false});
          }
        }
      } else {
        wx.hideLoading();
      }
    })
  }
})
