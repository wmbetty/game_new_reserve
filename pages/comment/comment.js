// pages/comment/comment.js 话题评论
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();

Page({
  data: {
    nvabarData: {
      title: '游戏攻略',
      showCapsule: 1
    },
    height: 0,
    commentId: '',
    name: '',
    sid: '',
    sname: ''
  },
  onLoad: function (options) {
    let that = this;
    if (options.name) {
      that.setData({name: options.name})
    }
    if (options.sname) {
      that.setData({sname: options.sname})
    }
    if (options.id) {
      that.setData({commentId: options.id})
    }
    that.setData({sid: options.sid});
    fun.wxLogin().then((res)=>{
      if (res) {
        let token = res;
        that.setData({token: token});
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
  inputDone (e) {
    let that = this;
    let pageData = that.data;
    let val = e.detail.value;
    let commentApi = backApi.commentListApi+pageData.token;
    let commentId = pageData.commentId;
    if (val==='') {
      Api.wxShowToast('你还没有输入内容哦~', 'none', 2000);
    } else {
      if (commentId==='') {
        fun.taskMake(commentApi,'POST',{strategy_id: pageData.sid,content: val},(res)=>{
          if (res.data.status*1===200) {
            Api.wxShowToast('评论成功~', 'none', 2000);
            app.aldstat.sendEvent(`评论内容-${val}`,{
              play : ""
            });
            setTimeout(()=>{
              wx.navigateBack()
            }, 1300)
          } else {
            Api.wxShowToast('评论失败~', 'none', 2000);
          }
        })
      } else {
        fun.taskMake(commentApi,'POST',{comment_id: commentId,strategy_id: pageData.sid,content: val}, (res)=>{
          if (res.data.status*1===200) {
            Api.wxShowToast('回复成功~', 'none', 2000);
            setTimeout(()=>{
              wx.navigateBack()
            }, 1300)
          } else {
            Api.wxShowToast('回复失败~', 'none', 2000);
          }
        })
      }
    }
  }
})
