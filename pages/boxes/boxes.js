// pages/boxes/boxes.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();
// let box1_i = 0;
// let box2_i = 0;
// let box3_i = 0;
let isSCroll = false;

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
    winWidth: 0,
    swipers: [],
    interval: 3000,
    autoplay: true,
    showFirstJoin: false,
    boxIdx: 0,
    showHandTip: true,
    isSlideUp: true,
    activityId: '',
    token: '',
    prizeObj: {},
    rewards: [],
    isFirstIn: false,
    swiperIdx: 0
    // isOpen: [0, 0, 0]
  },
  onLoad: function (options) {
    let that = this;
    let actId = options.activityId;
    that.setData({activityId: actId});
    let userInfo = wx.getStorageSync('userInfo');

    fun.wxLogin().then((loginRes)=>{
      if (loginRes) {
        let token = loginRes;
        that.setData({token: token});
        let activityViewApi = backApi.activityViewApi+token;
        let phoneReserveApi = backApi.phoneReserveApi + token;
        fun.quest(activityViewApi, 'GET', {activity_id: actId}, (res)=>{
          if (res) {
            that.setData({activity: res});
            if (options.isShareIn) {
              //
              that.setData({encryptId: options.encryptId, isFirstIn: false});
            } else {
              if (res.activity_extension_1_give_qualification) {
                that.setData({ isFirstIn: true })
              }
            }

            if (userInfo.id && options.isShareIn) {
              let pdata = {
                activity_id: actId,
                encrypt_id: options.encryptId,
                sign: 'invite'
              }
              fun.taskMake(phoneReserveApi, 'POST', pdata, (inviteRes)=>{
                if (inviteRes.data.status*1===200) {
                  console.log(inviteRes, 'ssss')
                  that.setData({showShareJoin: true, showMask: true, showKeyDialog: true, isSlideUp: true})
                } else {
                  Api.wxShowToast('已帮好友助力过喔~', 'none', 2000)
                }
              })
            }
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
              myPrizes: datas.my_prize_record, sendNumber: datas.send_number,
              rewardSendNumber: datas.reward_send_number, rewards: datas.reward
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
    let winWidth = app.globalData.screenWidth;
    that.setData({height: height, winHeight: winHeight, winWidth: winWidth});
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
    that.setData({showNoGift: false,showMask: false, showKeyDialog: false});
    let pdata = that.data;
    return {
      title: pdata.activity.friend_lang,
      imageUrl: pdata.activity.friend_url,
      path: `/pages/activityList/activityList?activityId=${pdata.activityId}&isBox=1&encryptId=${pdata.inviteDatas.member.encrypt_id}`
    }
  },
  onPageScroll (e) {
    let that = this;
    let isFirstIn = that.data.isFirstIn;
    let scrollTop = e.scrollTop*1;
    if (scrollTop>=600 && scrollTop<=800 && isFirstIn && !isSCroll) {
      that.setData({showMask: true, showKeyDialog: true, showFirstJoin: true, isSlideUp: true});
    }
  },
  // 点击下载游戏按钮
  downloadGame () {
    let that = this;
    let gameUrl = that.data.elements.activity_extension_1_game_download_link.value;
    let userInfo = wx.getStorageSync('userInfo');
     if (userInfo.id) {
       wx.setClipboardData({
          data: gameUrl,
          success: function(res) {
            setTimeout(()=>{
              that.setData({showClipboard: true, showMask: true,isSlideUp: true})
            }, 800)
          }
        })
     } else {
       that.setData({showDialog: true})
     }
   },
   hideDialog () {
     let that = this;
     that.setData({
       isSlideUp: false, showMask: false,
       showNoGift: false, showYourPrize: false,
       showGift: false, showNoGift: false, showClipboard: false,
       showKeyDialog: false, showShareJoin: false, showFirstJoin: false, showNomoreKeys: false
     });
   },
   shareInHideDialog () {
     let that = this;
     that.refreshTimes();
     let rewardInviteApi = backApi.rewardInviteApi+that.data.token;
     fun.quest(rewardInviteApi, 'GET', {activity_id: that.data.activityId}, (res)=>{
       if (res) {
         let datas = res;
         that.setData({inviteDatas: datas});
       }
     })
     that.setData({
       showNoGift: false, showMask: false, showYourPrize: false, isSlideUp: false,
       showGift: false, showNoGift: false, showClipboard: false,
       showKeyDialog: false, showShareJoin: false, showFirstJoin: false, showNomoreKeys: false
     })
   },
   FirstInHideDialog () {
     let that = this;
     isSCroll = true;
     that.refreshTimes();
     that.setData({
       showNoGift: false, showMask: false, showYourPrize: false, isSlideUp: false,
       showGift: false, showNoGift: false, showClipboard: false,
       showKeyDialog: false, showShareJoin: false, showFirstJoin: false, showNomoreKeys: false
     })
   },
   cancelDialog () {
     this.setData({showDialog:false})
   },
   confirmDialog (e) {
     let that = this;
     let updateUserInfoApi = backApi.updateUserInfoApi+that.data.token;
     let phoneReserveApi = backApi.phoneReserveApi + that.data.token;
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
                 let pdata = {
                   activity_id: that.data.activityId,
                   encrypt_id: that.data.encryptId,
                   sign: 'invite'
                 }
                 fun.taskMake(phoneReserveApi, 'POST', pdata, (inviteRes)=>{
                   if (inviteRes.data.status*1===200) {
                     if (that.data.activity.activity_extension_1_be_invite_get_qualification) {
                       that.setData({showShareJoin: true, showMask: true, showKeyDialog: true})
                     }
                   } else {
                     console.log(inviteRes.data.msg)
                   }
                 })
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
     let rewardDataApi = backApi.rewardDataApi+that.data.token;
     let rewardCount = that.data.rewardCount*1;
     let userInfo = wx.getStorageSync('userInfo');
     // let isOpen = that.data.isOpen;
     // if (box*1===1) {
     //   box1_i++
     // }
     // if (box*1===2) {
     //   box2_i++
     // }
     // if (box*1===3) {
     //   box3_i++
     // }
     if (userInfo.id) {
       if (rewardCount>=1) {
         that.setData({boxIdx: box, showHandTip: false});
         // that.setData({showHandTip: false, isOpen: isOpen});
         setTimeout(()=>{
           that.setData({showHandTip: true});
         },1200);
         fun.quest(rewardLotteryApi, 'POST', {activity_id: activityId},(res)=>{
           if (res) {
             /** 获得奖品 */
             setTimeout(()=>{
               if (res.status*1===1) {
                 if (res.prize.is_prize*1!==2) {
                   that.setData({showGift: true, isSlideUp: true});
                 } else {
                   that.setData({showNoGift: true, isSlideUp: true});
                 }
                 that.setData({
                   prizeObj: res.prize, showMask: true
                 });
               } else {
                 Api.wxShowToast(res.msg, 'none', 2000);
               }
               that.setData({boxIdx: 0, showHandTip: true});
               fun.quest(rewardDataApi, 'GET', {activity_id: activityId}, (res)=>{
                 if (res) {
                   let datas = res;
                   that.setData({prizeRecord: datas.prize_record, rewardCount: datas.reward_count,
                     myPrizes: datas.my_prize_record
                   });
                 }
               })
             },900)
           }
         })
       } else {
         that.setData({showMask: true, showKeyDialog: true, showNomoreKeys: true, isSlideUp: true})
       }
     } else {
       that.setData({showDialog: true})
     }
   },
   hideGetPrize () {
     let that = this;
     // that.setData({isSlideUp: false});
     setTimeout(()=>{
       that.setData({
         showNoGift: false, showMask: false, showYourPrize: false, isSlideUp: false,
         showGift: false, showNoGift: false, showClipboard: false,
         showKeyDialog: false, showShareJoin: false, showFirstJoin: false, showNomoreKeys: false
       })
     },300)
   },
   hideNoGift () {
     let that = this;
     // that.setData({isSlideUp: false});
     setTimeout(()=>{
       that.setData({
         showNoGift: false, showMask: false, showYourPrize: false, isSlideUp: false,
         showGift: false, showNoGift: false, showClipboard: false,
         showKeyDialog: false, showShareJoin: false, showFirstJoin: false, showNomoreKeys: false
       })
     },300)
   },
   hideYourPrize () {
     this.setData({
       showNoGift: false, showMask: false, showYourPrize: false, isSlideUp: false,
       showGift: false, showNoGift: false, showClipboard: false,
       showKeyDialog: false, showShareJoin: false, showFirstJoin: false, showNomoreKeys: false
     })
   },
   lookYourGiftRecord (e) {
     let that = this;
     let rname = e.currentTarget.dataset.rname;
     that.setData({showMask: true, pname: rname, showYourPrize: true, isSlideUp: true});
   },
   refreshTimes () {
     let that = this;
     let pageData = that.data;
     let rewardDataApi = backApi.rewardDataApi+pageData.token;
     let userInfo = wx.getStorageSync('userInfo');
     if (userInfo.id) {
       wx.showLoading({title: '刷新中'});
       fun.quest(rewardDataApi, 'GET', {activity_id: pageData.activityId}, (res)=>{
         if (res) {
           wx.hideLoading();
           let datas = res;
           that.setData({prizeRecord: datas.prize_record,rewardCount: datas.reward_count});
         } else {
           wx.hideLoading();
         }
       });
       let rewardInviteApi = backApi.rewardInviteApi+pageData.token;
       fun.quest(rewardInviteApi, 'GET', {activity_id: pageData.activityId}, (res)=>{
         if (res) {
           let datas = res;
           that.setData({inviteDatas: datas});
         }
       })
     } else {
       that.setData({showDialog: true})
     }
   },
   swiperChange (e) {
     this.setData({
      swiperIdx: e.detail.current
    })
  }
})
