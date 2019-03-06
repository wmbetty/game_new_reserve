// pages/getPrize/getPrize.js 抽奖页
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
    animationData: {},
    hidden: true,       //中奖展示
    disabled: false,    //指针按钮是否可点击
    showMask: false,
    showGetPrize: false,
    showOffical: false,
    showPinmy: false,
    autoplay: true,
    interval: 3000,
    duration: 500,
    activityId: '',
    myPrizes: [],
    prizeRecord: [],
    tasks: [],
    rewardCount: 0,
    prizeObj: {},
    is_prize: 1,
    goActive: false,
    showRotate: false,
    showDegree: 0,
    rewardUrl: '',
    btnDis: false,
    rules: [],
    showPlate1: true,
    luckDrawAnimation: {},
    sendNumber: '',
    rewardSendNumber: ''
  },
  onLoad: function (options) {
    let that = this;
    that.setData({activityId: options.activityId});
    app.aldstat.sendEvent(`进入抽奖页面，当前活动id为${options.activityId}`,{
      play : ""
    });
    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            that.setData({token: token});
          } else {
            console.log('token获取失败')
          }
        })
      }
    })

    wx.setStorageSync('pinActivityId', options.activityId);
  },
  onReady: function () {},
  onShow: function () {
    let that = this;
    let pageData = that.data;
    let height = app.globalData.height;
    let winHeight = app.globalData.screenHeight;
    let gzCode = wx.getStorageSync('gzCode');
    that.setData({height: height, winHeight: winHeight});
    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            let attentionTaskApi = backApi.phoneReserveApi+token;
            let rewardDataApi = backApi.rewardDataApi+token;
            if (gzCode) {
              fun.taskMake(attentionTaskApi, 'POST', {activity_id: pageData.activityId, sign: 'attention', code: gzCode, scene: '1035'}, (res)=>{
                if (res.data.status*1===200) {
                  console.log('关注成功')
                } else {
                  console.log(res, '出错了')
                }
              })
              setTimeout(()=>{
                fun.quest(rewardDataApi, 'GET', {activity_id: pageData.activityId}, (res)=>{
                  if (res) {
                    let datas = res;
                    that.setData({myPrizes: datas.my_prize_record, prizeRecord: datas.prize_record,
                      tasks: datas.task, rewardCount: datas.reward_count, rewardUrl: datas.reward_url,
                      rules: datas.rule, sendNumber: datas.send_number, rewardSendNumber: datas.reward_send_number
                    });
                  }
                })
              }, 200)
            } else {
              fun.quest(rewardDataApi, 'GET', {activity_id: pageData.activityId}, (res)=>{
                if (res) {
                  let datas = res;
                  that.setData({myPrizes: datas.my_prize_record, prizeRecord: datas.prize_record,
                    tasks: datas.task, rewardCount: datas.reward_count, rewardUrl: datas.reward_url,
                    rules: datas.rule, sendNumber: datas.send_number, rewardSendNumber: datas.reward_send_number
                  });
                }
              })
            }
          } else {
            console.log('token获取失败')
          }
        })
      }
    })
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo.id) {
      that.setData({showDialog: true})
    }
  },
  refreshTimes () {
    let that = this;
    let pageData = that.data;
    let rewardDataApi = backApi.rewardDataApi+pageData.token;
    wx.showLoading({title: '刷新中'});
    fun.quest(rewardDataApi, 'GET', {activity_id: pageData.activityId}, (res)=>{
      if (res) {
        wx.hideLoading();
        app.aldstat.sendEvent(`抽奖页点击刷新按钮`,{
          play : ""
        });
        let datas = res;
        that.setData({myPrizes: datas.my_prize_record, prizeRecord: datas.prize_record,
          tasks: datas.task, rewardCount: datas.reward_count, rewardUrl: datas.reward_url});
      }
    })
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onTurnTap: function (e) {
    let that = this;
    let pageData = that.data;
    let activityId = pageData.activityId;
    let rewardCount = pageData.rewardCount;
    let btnDisabled = pageData.disabled;
    let showPlate6 = pageData.showPlate6;

    if (!btnDisabled) {
      if (rewardCount*1>0) {
        that.setData({rewardCount: rewardCount*1-1, disabled: true});
        wx.showLoading();
        let rewardLotteryApi = backApi.rewardLotteryApi+pageData.token;
        fun.quest(rewardLotteryApi, 'POST', {activity_id: activityId},(res)=>{
          if (res) {
            app.aldstat.sendEvent(`点击转盘抽奖`,{
              play : ""
            });
            wx.hideLoading();
            /** 获取到中奖结果后，转盘才开始启动 */
            let duration = 5000; //转盘时长
            let circle = 8; //转盘圈数（1圈为360度）
            let degree = parseInt(360 * circle)  + parseInt(res.prize.degree); //最终转盘要转的度数
            let animation = wx.createAnimation({
              duration: duration,
              timingFunction: 'ease-in-out',
            })
            that.animation = animation
            animation.rotate(-degree).step()
            that.setData({
              luckDrawAnimation: animation.export()
            });
            setTimeout(()=>{
              animation.rotate(-res.prize.degree).step({
                duration: 0
              })
              that.setData({
                luckDrawAnimation: animation.export(),
                disabled: false
              })
              /** 获得奖品 */
              that.setData({
                prizeObj: res.prize, showGetPrize: true, showMask: true
              });
            }, duration)
            // let degree = res.prize.degree*1;
            // that.setData({goActive: true});

            // let rewardDataApi = backApi.rewardDataApi+pageData.token;
            // fun.quest(rewardDataApi, 'GET',{activity_id: activityId},(res)=>{
            //   if (res) {
            //     that.setData({myPrizes: res.my_prize_record, prizeRecord: res.prize_record,
            //       tasks: res.task});
            //   }
            // })
          } else {
            wx.hideLoading();
          }
        })
      } else {
        Api.wxShowToast('机会用完了，快去做任务吧', 'none', 2000);
      }
    } else {
      Api.wxShowToast('抽奖中，请勿频繁操作~', 'none', 2000);
    }

  },
  goInvite (e) {
    // let type = e.currentTarget.dataset.type*1;
    // if (type*1!==1) {
    //   wx.navigateTo({
    //     url: `/pages/invitePrize/invitePrize?activityId=${this.data.activityId}`
    //   })
    // }
    app.aldstat.sendEvent(`抽奖页点击邀请按钮`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/inviteNew/inviteNew?activityId=${this.data.activityId}`
    })
  },
  showOffical (e) {
    let that = this;
    let type = e.currentTarget.dataset.type*1;
    if (type*1!==1) {
      that.setData({showOffical: true, showMask: true})
    }
    app.aldstat.sendEvent(`抽奖页点击关注按钮`,{
      play : ""
    });
  },
  hideMask () {
    this.setData({
      showMask: false, showOffical: false, showGetPrize: false, showPinmy: false,
      showPlate3: false, showPlate4: false, showPlate2: false, showPlate6: true, showPlate5: false
    })
  },
  openContact () {
    app.aldstat.sendEvent(`点击联系客服`,{
      play : ""
    });
    this.setData({showMask: false, showOffical: false, showGetPrize: false})
  },
  goPinMy (e) {
    let type = e.currentTarget.dataset.type*1;
    app.aldstat.sendEvent(`点击添加我的小程序按钮`,{
      play : ""
    });
    if (type*1!==1) {
      this.setData({showMask: true, showPinmy: true})
    }
  },
  goReserve (e) {
    let type = e.currentTarget.dataset.type*1;
    if (type*1!==1) {
      wx.navigateTo({
        url: '/pages/reserveGame/reserveGame?activityId='+this.data.activityId
      })
    }
  },
  hidePinmy () {
    this.setData({
      showMask: false, showOffical: false, showGetPrize: false, showPinmy: false,
      showPlate3: false, showPlate4: false, showPlate2: false, showPlate6: true, showPlate5: false
    })
  },
  goAnswer (e) {
    let type = e.currentTarget.dataset.type*1;
    app.aldstat.sendEvent(`抽奖页点击答题按钮`,{
      play : ""
    });
    if (type*1!==1) {
      wx.navigateTo({
        url: `/pages/answerQues/answerQues?activityId=${this.data.activityId}`
      })
    }
  }
})
