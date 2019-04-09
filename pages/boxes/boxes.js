// pages/boxes/boxes.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();

Page({
  data: {
    showClipboard: false,
    showMask: false,
    showYourPrize: false,
    showGift: false,
    showNoGift: false,
    showNomoreKeys: false,
    showInviteTips: false,
    showGiveKeys: false,
    nvabarData: {
      title: '',
      showCapsule: 1,
      noBgColor: true,
      backIsCircle: true
    },
    nvabarData1: {
      title: '',
      showCapsule: 1,
      noBgColor: true,
      backIsCircle: true,
      isQrcodeIn: true
    },
    isQrcodeIn: false,
    showDialog: false,
    authInfo: '微信授权才能操作哦',
    height: 0,
    winHeight: 0,
    swipers: [],
    interval: 3000,
    autoplay: true,
    showFirstJoin: false,
    boxIdx: 0,
    showHandTip: true,
    isSlideUp: true,
    activityId: '',
    token: '',
    prizeObj: {}
  },
  onLoad: function (options) {
    let that = this;
    let actId = options.activityId || 6;
    that.setData({activityId: actId})
    fun.wxLogin().then((res)=>{
      if (res) {
        let token = res;
        that.setData({token: token});
        let activityViewApi = backApi.activityViewApi+token;
        fun.quest(activityViewApi, 'GET', {activity_id: actId}, (res)=>{
          if (res) {
            that.setData({activity: res});
          }
        })
        let reserveElementsApi = backApi.reserveElementsApi+token;
        fun.quest(reserveElementsApi, 'GET', {activity_id: actId}, (res)=>{
          if (res) {
            let len = Object.keys(res).length;
            if (len===0) {
              that.setData({noElements: true})
            } else {
              that.setData({
                elements: res
              })
            }
          }
        })
        let rulesApi = backApi.rulesApi+token;
        fun.quest(rulesApi, 'GET', {activity_id: actId}, (res)=>{
          if (res) {
            that.setData({rules: res})
          }
        })
        let gameGeaturesApi = backApi.gameGeaturesApi+token;
        fun.quest(gameGeaturesApi, 'GET', {activity_id: actId}, (res)=>{
          if (res) {
            that.setData({swipers: res})
          }
        })
        let rewardDataApi = backApi.rewardDataApi+token;
        fun.quest(rewardDataApi, 'GET', {activity_id: actId}, (res)=>{
          if (res) {
            let datas = res;
            that.setData({prizeRecord: datas.prize_record, rewardCount: datas.reward_count,
              rewardUrl: datas.reward_url, myPrizes: datas.my_prize_record, sendNumber: datas.send_number,
              rewardSendNumber: datas.reward_send_number
            });
          }
        })
        let rewardInviteApi = backApi.rewardInviteApi+token;
        fun.quest(rewardInviteApi, 'GET', {activity_id: actId}, (res)=>{
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
  onReady: function () {

  },
  onShow: function () {
    let that = this;
    let height = app.globalData.height;
    let winHeight = app.globalData.screenHeight;
    that.setData({height: height, winHeight: winHeight});
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo.id) {
      that.setData({showDialog:true})
    }
  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
  onShareAppMessage: function () {
    let that = this;
    that.setData({showNoGift: false,showMask: false})
  },
  onPageScroll (e) {
    let scrollTop = e.scrollTop*1;
    if (scrollTop>=700 && scrollTop<=800) {
      // this.setData({showMask: true, showKeyDialog: true, showFirstJoin: true})
    }
  },
  // 点击下载游戏按钮
  downloadGame () {
    let that = this;
    let gameUrl = 'https://baidu.com';
    wx.setClipboardData({
       data: gameUrl,
       success: function(res) {
         setTimeout(()=>{
           that.setData({showClipboard: true, showMask: true})
         }, 2100)
       }
     })
   },
   goTakeGift () {
     let that = this;
     that.setData({showInviteTips: false, showMask: false})
   },
   hideDialog () {
     let that = this;
     that.setData({
       showNoGift: false, showMask: false, showInviteTips: false,
       showGift: false, showGiveKeys: false, showNoGift: false, showClipboard: false
     })
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
   },
   openBox (e) {
     let that = this;
     let activityId = that.data.activityId;
     let box = e.currentTarget.dataset.box;
     let rewardLotteryApi = backApi.rewardLotteryApi+that.data.token;
     let rewardCount = that.data.rewardCount*1;
     if (rewardCount>=1) {
       that.setData({boxIdx: box, showHandTip: false});
       setTimeout(()=>{
         that.setData({showHandTip: true});
       },1200);
       fun.quest(rewardLotteryApi, 'POST', {activity_id: activityId},(res)=>{
         if (res) {
           /** 获得奖品 */
           setTimeout(()=>{
             that.setData({
               prizeObj: res.prize, showMask: true
             });
           },1300)
         }
       })
     } else {
       console.log('钥匙不够了！')
     }

   },
   hideGetPrize () {
     let that = this;
     that.setData({isSlideUp: false});
     setTimeout(()=>{
       that.setData({showGift: false,showMask: false})
     },300)
   },
   hideNoGift () {
     let that = this;
     that.setData({isSlideUp: false});
     setTimeout(()=>{
       that.setData({showNoGift: false,showMask: false})
     },300)
   },
   hideYourPrize () {
     this.setData({showYourPrize: false,showMask: false})
   }
})
