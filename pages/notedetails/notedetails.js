// pages/notedetails/notedetails.js 公告详情
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
let WxParse = require('../../wxParse/wxParse.js');

const app = getApp();

Page({
  data: {
    nvabarData: {
      title: '',
      showCapsule: 1
    },
    height: 0,
    newsId: '',
    details: {}
  },
  onLoad: function (options) {
    let that = this;
    that.setData({newsId: options.id});
    app.aldstat.sendEvent(`进入公告详情页，当前公告id为${options.id}`,{
      play : ""
    });

    fun.wxLogin().then((res)=>{
      if (res) {
        let token = res;
        that.setData({token: token});
        let newsDetailApi = backApi.newsDetailApi+options.id;
        wx.showLoading();
        fun.quest(newsDetailApi,'GET',{'access-token': token},(res)=>{
          if (res) {
            wx.hideLoading();
            let nvabarData = {
              title: res.title, showCapsule: 1
            }
            that.setData({details: res, nvabarData: nvabarData});
            WxParse.wxParse('article', 'html', res.content, that, 0);
          } else {
            wx.hideLoading();
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
    let newsId = that.data.newsId;
    app.aldstat.sendEvent(`公告详情页分享，当前公告id为${newsId}`,{
      play : ""
    });
    return {
      title: that.data.details.title,
        path: `/pages/index/index?newsId=${newsId}`
      }
  }
})
