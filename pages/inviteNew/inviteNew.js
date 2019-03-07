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
    authInfo: '需要获取相册权限才能保存图片哦'
  },
  onLoad: function (options) {
    let that = this;
    that.setData({activityId: options.activityId});
    fun.wxLogin().then((res)=>{
      if (res) {
        let token = res;
        that.setData({token: token});
        let rewardInviteApi = backApi.rewardInviteApi+token;
        fun.quest(rewardInviteApi, 'GET', {activity_id: options.activityId}, (res)=>{
          if (res) {
            let datas = res;
            that.setData({inviteDatas: datas});
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
    let winHeight = app.globalData.screenHeight;
    that.setData({height: height, winHeight: winHeight});
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    let that = this;
    let pdata = that.data;
    let inviteDatas = pdata.inviteDatas;
    return {
      title: inviteDatas.friend_lang,
      imageUrl: inviteDatas.friend_url,
      path: `/pages/index/index?activityId=${pdata.activityId}&encryptId=${inviteDatas.member.encrypt_id}&reserveMode=${1}`
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
  }
})
