// pages/invitePrize/invitePrize.js 有奖邀请页
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();

Page({
  data: {
    nvabarData: {
      title: '',
      showCapsule: 1,
      noBgColor: true,
      backIsCircle: true
    },
    height: 0,
    token: '',
    winHeight: 0,
    activityId: '',
    inviteDatas: {},
    showDialog: false,
    openType: 'openSetting',
    authInfo: '需要获取相册权限才能保存图片哦',
    showGetPrizeBtn: false,
    elements: {}
  },
  onLoad: function (options) {
    let that = this;
    let actId = options.activityId;
    let isReserve = options.isReserve;
    let isReward = options.isReward;
    if (isReserve) {
      that.setData({showSucc: true})
    }
    if (isReserve && isReward*1===1) {
      that.setData({showGetPrizeBtn: true})
    }
    that.setData({activityId: actId});
    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            that.setData({token: token});
            let rewardInviteApi = backApi.rewardInviteApi+token;
            fun.quest(rewardInviteApi, 'GET', {activity_id: actId}, (res)=>{
              if (res) {
                let datas = res;
                that.setData({inviteDatas: datas});
              }
            })
            let reserveElementsApi = backApi.reserveElementsApi+token;
            fun.quest(reserveElementsApi, 'GET', {activity_id: actId}, (res)=>{
              if (res) {
                that.setData({
                  elements: res
                })
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
    let winHeight = app.globalData.screenHeight;
    that.setData({height: height, winHeight: winHeight});
    app.aldstat.sendEvent(`进入邀请好友页面`,{
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
    let inviteDatas = pdata.inviteDatas;
    app.aldstat.sendEvent(`邀请好友页分享，活动id${pdata.activityId}`,{
      play : ""
    });
    return {
      title: inviteDatas.friend_lang,
      imageUrl: inviteDatas.friend_url,
      path: `/pages/index/index?activityId=${pdata.activityId}&encryptId=${inviteDatas.member.encrypt_id}`
    }
  },
  savePoster () {
    let that = this;
    let pdata = that.data;
    let invitePosterApi = backApi.invitePosterApi+pdata.token;
    fun.quest(invitePosterApi, 'POST', {activity_id: pdata.activityId}, (res)=>{
      if (res) {
        let datas = res;
        wx.showToast({
          title: '保存中...',
          icon: 'loading',
          duration: 3300
        });
        app.aldstat.sendEvent(`邀请好友页保存图片，活动id${pdata.activityId}`,{
          play : ""
        });
        if (datas.share_url) {
          setTimeout(()=>{
            wx.downloadFile({
              url: datas.share_url,
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
        }
      }
    })
  },
  goPrize () {
    wx.navigateTo({
      url: `/pages/reserveGames/reserveGames?activityId=${this.data.activityId}&isSucc=1}`
    })
  }
})
