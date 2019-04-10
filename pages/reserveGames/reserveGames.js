// pages/reserveGame/reserveGame.js 预约落地页
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();

Page({
  data: {
    isAndrod: true,
    showInput: false,
    phone: '',
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
    height: 0,
    token: '',
    winHeight: 0,
    showConfirmBtn: false,
    verifyCode: '',
    showPhone: false,
    reserveSuccess: false,
    showReserve: true,
    activityId: '',
    activity: {},
    showDialog: false,
    authInfo: '微信授权才能预约哦',
    showPhoneSlideDown: false,
    showNoReserve: false,
    showPhoneCont: true,
    interval: 3000,
    autoplay: true,
    swiperIdx: 0,
    elements: {},
    rules: [],
    prizeRecord: [],
    rewardCount: '',
    rewardUrl: '',
    showMask: false,
    showToast: false,
    showReserved: false,
    noElements: false,
    showMoreList: false,
    luckDrawAnimation: {},
    myPrizes: [],
    showGetPrize: false,
    inviteDatas: {},
    pname: '',
    sendNumber: '',
    rewardSendNumber: ''
  },
  onLoad: function (options) {
    let that = this;
    fun.wxLogin().then((res)=>{
      if (res) {
        let token = res;
        that.setData({token: token});
        if(options.scene){
          let scene = decodeURIComponent(options.scene);
          //&是我们定义的参数链接方式
          let scenes = scene.split("&");
          if (scenes.length===2) {
            let activityId = scenes[0];
            that.setData({activityId: activityId, isQrcodeIn: true});
            app.aldstat.sendEvent(`通过小程序码进入预约页面(预约模板2)，当前活动id为${activityId}`,{
              play : ""
            });
            let encryptId = scenes[1];
            if (encryptId) {
              let phoneReserveApi = backApi.phoneReserveApi + token;
              let pdata = {
                activity_id: activityId,
                encrypt_id: encryptId,
                sign: 'invite'
              }
              fun.taskMake(phoneReserveApi, 'POST', pdata, (res)=>{
                if (res.data.status*1===200) {
                  console.log('邀请成功，获得一次抽奖机会')
                } else {
                  console.log(res.data.msg)
                }
              })
            }
          }
        } else {
          let encryptId = wx.getStorageSync('encryptId');
          if (encryptId) {
            let phoneReserveApi = backApi.phoneReserveApi + token;
            let pData = {
              activity_id: options.activityId,
              encrypt_id: encryptId,
              sign: 'invite'
            }
            fun.taskMake(phoneReserveApi, 'POST', pData, (res)=>{
              if (res.data.status*1===200) {
                console.log('邀请成功，获得一次抽奖机会')
                wx.setStorageSync('encryptId', '');
              } else {
                console.log(res.data.msg)
              }
            })
          }
        }
        let source = options.source;
        if (source) {
          let sourceApi = backApi.sourceApi+token;
          fun.quest(sourceApi, 'POST', {source: source, activity_id: options.activityId}, (res)=>{
            console.log(res, 'sss')
          })
        }
        if (source==='platform') {
          let activityId = options.activityId;
          // 平台对接逻辑
          let activityViewApi = backApi.activityViewApi+token;
          fun.quest(activityViewApi, 'GET', {activity_id: activityId}, (res)=>{
            if (res) {
              that.setData({activity: res, isQrcodeIn: true, activityId: activityId});
              if (res.is_booking*1!==1) {
                that.setData({showToast: true, showMask: true});
              } else {
                that.setData({showToast: false, showMask: false});
                Api.wxShowToast('已验证过手机预约~', 'none', 2000);
                let noElements = that.data.noElements;
                if (!noElements) {
                  let scrollTop = that.data.winHeight*2;
                  setTimeout(()=>{
                    wx.pageScrollTo({
                      scrollTop: scrollTop,
                      duration: 400
                    })
                  },1200)
                }
              }
            }
          })
        }
        let isSucc = options.isSucc;
        let scrollTop = that.data.winHeight*2;
        let noElements = that.data.noElements;
        if (!noElements && isSucc) {
          setTimeout(()=>{
            wx.pageScrollTo({
              scrollTop: scrollTop,
              duration: 400
            })
          },1200)
        }
      } else {
        Api.wxShowToast('微信登录失败~', 'none', 2000);
      }
    })

    let platform = app.globalData.platform;
    if (platform === 'IOS') {
      that.setData({isAndrod: false})
      app.aldstat.sendEvent(`ios进入预约页面(模板2)`,{
        play : ""
      });
    } else {
      app.aldstat.sendEvent(`安卓进入预约页面(模板2)`,{
        play : ""
      });
    }
    let actId = options.activityId;
    if (actId) {
      that.setData({activityId: actId});
      app.aldstat.sendEvent(`进入预约游戏页面，当前活动id为${actId}`,{
        play : ""
      });
    }
  },
  onReady: function () {},
  onShow: function () {
    let that = this;

    let phone = wx.getStorageSync('phone');
    if (phone) {
      that.setData({showInput: true, phone: phone})
    }
    let height = app.globalData.height;
    let winHeight = app.globalData.screenHeight;
    that.setData({height: height, winHeight: winHeight});
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo.id) {
      that.setData({showDialog:true})
    }

    setTimeout(()=>{
      let pageData = that.data;
      let aid = pageData.activityId;
      fun.wxLogin().then((res)=>{
        if (res) {
          let token = res;
          let activityViewApi = backApi.activityViewApi+token;
          fun.quest(activityViewApi, 'GET', {activity_id: aid}, (res)=>{
            if (res) {
              that.setData({activity: res});
              if (res.is_booking*1===1) {
                that.setData({showReserved: true})
              }else {
                that.setData({showNoReserve: true})
              }
            }
          })
          let reserveElementsApi = backApi.reserveElementsApi+token;
          fun.quest(reserveElementsApi, 'GET', {activity_id: aid}, (res)=>{
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
          fun.quest(rulesApi, 'GET', {activity_id: aid}, (res)=>{
            if (res) {
              that.setData({rules: res})
            }
          })
          let gameGeaturesApi = backApi.gameGeaturesApi+token;
          fun.quest(gameGeaturesApi, 'GET', {activity_id: aid}, (res)=>{
            if (res) {
              that.setData({swipers: res})
            }
          })
          let rewardDataApi = backApi.rewardDataApi+token;
          fun.quest(rewardDataApi, 'GET', {activity_id: aid}, (res)=>{
            if (res) {
              let datas = res;
              that.setData({prizeRecord: datas.prize_record, rewardCount: datas.reward_count,
                rewardUrl: datas.reward_url, myPrizes: datas.my_prize_record, sendNumber: datas.send_number,
                rewardSendNumber: datas.reward_send_number
              });
            }
          })
          let ladderApi = backApi.ladderApi+token;
          fun.quest(ladderApi, 'GET', {activity_id: aid}, (res)=>{
            if (res) {
              let datas = res;
              that.setData({ladders: datas});
            }
          })
          let rewardInviteApi = backApi.rewardInviteApi+token;
          fun.quest(rewardInviteApi, 'GET', {activity_id: aid}, (res)=>{
            if (res) {
              let datas = res;
              that.setData({inviteDatas: datas});
            }
          })
        } else {
          Api.wxShowToast('微信登录失败~', 'none', 2000);
        }
     })
   },1250)
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    let that = this;
    let pdata = that.data;
    app.aldstat.sendEvent(`模板2预约游戏页面分享，当前活动id为${pdata.activityId}`,{
      play : ""
    });
    return {
      title: pdata.activity.friend_lang,
      imageUrl: pdata.activity.friend_url,
      path: `/pages/index/index?activityId=${pdata.activityId}&mode=2`
    }
  },
  choosePlat (e) {
    let that = this;
    let type = e.currentTarget.dataset.type*1;
    if (type===1) {
      that.setData({isAndrod: true})
      app.aldstat.sendEvent(`模板2预约游戏页面选择安卓，当前活动id为${that.data.activityId}`,{
        play : ""
      });
    } else {
      app.aldstat.sendEvent(`模板2预约游戏页面选择苹果，当前活动id为${that.data.activityId}`,{
        play : ""
      });
      that.setData({isAndrod: false})
    }
  },
  getPhoneNumber (e) {
    let that = this;
    let pdata = that.data;
    // let errMsg = e.detail.errMsg;
    app.aldstat.sendEvent(`模板2获取手机号,当前活动id为${pdata.activityId}`,{
      play : ""
    });
    if (e.detail.encryptedData) {
      // 获取手机号需login
      wx.login({
        success: function (res) {
          let code = res.code;
          let phoneNumberApi = backApi.phoneNumberApi+'?access-token='+pdata.token;
          let userData = {
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv,
            code: code
          }
          fun.quest(phoneNumberApi, 'POST', userData, (res)=>{
            if (res) {
              let phone = res;
              wx.setStorageSync('phone', phone);
              that.setData({showInput: true, phone: phone});
              Api.wxShowToast('手机授权成功', 'none', 2000);
            }
          })
        }
      })
    } else {
      that.setData({showInput: true})
    }
  },
  codeBlur (e) {
    let that = this;
    let code = e.detail.value;
    that.setData({verifyCode: code});
  },
  phoneBlur (e) {
    let that = this;
    let phone = e.detail.value;
    that.setData({phone: phone});
    wx.setStorageSync('phone', phone)
  },
  sendCode () {
    let that = this;
    let pageData = that.data;
    let phone = pageData.phone;
    let type = pageData.isAndrod?1:2;
    if (phone==='') {
      Api.wxShowToast('请输入手机号', 'none', 2000);
      return false
    }
    if(!(/^1[3456789]\d{9}$/.test(phone))){
        Api.wxShowToast('手机格式不正确', 'none', 2000);
        return false;
    }
    let reserveData = {
      activity_id: pageData.activityId,
      phone: phone,
      type: type,
      sign: 'booking'
    }
    let phoneReserveApi = backApi.phoneReserveApi+pageData.token;
    fun.taskMake(phoneReserveApi, 'POST', reserveData, (res)=>{
      if (res.data.status*1===200) {
        Api.wxShowToast('预约成功', 'none', 1500);
        app.aldstat.sendEvent(`模板2预约成功,当前活动id为${pageData.activityId}`,{
          play : ""
        });
        setTimeout(()=>{
          wx.navigateTo({
            url: `/pages/invitePrize/invitePrize?activityId=${pageData.activityId}&isReserve=1&isReward=${pageData.activity.open_reward}`
          })
        },1600)
      } else {
        Api.wxShowToast(res.data.msg, 'none', 2000);
      }
    })
  },
  gotoInvite () {
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      app.aldstat.sendEvent(`模板2预约页面点击邀请好友,当前活动id为${this.data.activityId}`,{
        play : ""
      });
      wx.navigateTo({
        url: `/pages/invitePrize/invitePrize?activityId=${this.data.activityId}`
      })
    } else {
      this.setData({showDialog: true})
    }
  },
  getPrize () {
    let that = this;
    app.aldstat.sendEvent(`模板2预约完成去抽奖，当前活动id为${that.data.activityId}`,{
      play : ""
    });
    wx.navigateTo({
      url: '/pages/getGift/getGift?activityId='+that.data.activityId
    })
    that.setData({
      showPhone: false,
      reserveSuccess: false,
      showReserve: true
    })
  },
  showPhoneInfo () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    let activity = that.data.activity;
    if (userInfo.id) {
      app.aldstat.sendEvent(`模板2预约页面点击立即预约按钮，当前活动id为${that.data.activityId}`,{
        play : ""
      });
      if (activity.is_booking*1===1) {
        Api.wxShowToast('您已预约成功，邀请好友预约吧', 'none', 2000);
        setTimeout(()=>{
          wx.navigateTo({
            url: `/pages/invitePrize/invitePrize?activityId=${that.data.activityId}&isReserve=1`
          })
        }, 2100)
      } else {
        that.setData({ showPhone: true, showMask: true })
      }
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
  toggleSlide () {
    let that = this;
    let showPhoneSlideDown = that.data.showPhoneSlideDown;
    if (!showPhoneSlideDown) {
      that.setData({showPhoneSlideDown: true, showPhoneCont: false});
    } else {
      that.setData({showPhoneSlideDown: false, showPhoneCont: true});
    }
  },
  imageChange (e) {
    let curr = e.detail.current;
    this.setData({swiperIdx: curr})
  },
  hideGetPrize () {
    this.setData({showGetPrize: false})
  },
  hideMask () {
    this.setData({showMask: false})
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
          app.aldstat.sendEvent(`点击抽奖刷新按钮`,{
            play : ""
          });
          let datas = res;
          that.setData({prizeRecord: datas.prize_record,rewardCount: datas.reward_count});
        } else {
          wx.hideLoading();
        }
      })
    } else {
      that.setData({showDialog: true})
    }
  },
  verifyPhone (e) {
    let that = this;
    let pageData = that.data;
    let errMsg = e.detail.errMsg;
    app.aldstat.sendEvent(`预约模板2平台对接页面按钮点击,当前活动id为${pageData.activityId}`,{
      play : ""
    });
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      if (e.detail.encryptedData) {
        wx.login({
          success: function (res) {
            let code = res.code;
            let phoneNumberApi = backApi.phoneNumberApi+'?access-token='+pageData.token;
            let userData = {
              encryptedData: e.detail.encryptedData,
              iv: e.detail.iv,
              code: code
            }
            fun.quest(phoneNumberApi, 'POST', userData, (res)=>{
              if (res) {
                let phone = res;
                wx.setStorageSync('phone', phone);
                that.setData({phone: phone});
                // 预约接口
                let type = pageData.isAndrod?1:2;
                let reserveData = {
                  activity_id: pageData.activityId,
                  phone: phone,
                  type: type,
                  sign: 'booking'
                }
                let phoneReserveApi = backApi.phoneReserveApi+pageData.token;
                fun.taskMake(phoneReserveApi, 'POST', reserveData, (res)=>{
                  if (res.data.status*1===200) {
                    Api.wxShowToast('手机授权成功，验证已预约', 'none', 1500);
                    let scrollTop = pageData.winHeight*2;
                    let noElements = pageData.noElements;
                    that.setData({showMask: false});
                    let rewardDataApi = backApi.rewardDataApi+pageData.token;
                    if (!noElements) {
                      setTimeout(()=>{
                        fun.quest(rewardDataApi, 'GET', {activity_id: pageData.activityId}, (res)=>{
                          if (res) {
                            let datas = res;
                            that.setData({rewardCount: datas.reward_count});
                          } else {
                            console.log('出错了~')
                          }
                        });
                        let activityViewApi = backApi.activityViewApi + pageData.token;
                        fun.quest(activityViewApi, 'GET', { activity_id: pageData.activityId},    (res) => {
                          if (res) {
                            that.setData({ activity: res });
                            if (res.is_booking * 1 === 1) {
                              that.setData({ showReserved: true })
                            } else {
                              that.setData({ showNoReserve: true })
                            }
                          }
                        });
                        wx.pageScrollTo({
                          scrollTop: scrollTop,
                          duration: 400
                        })
                      },1200)
                    }
                  } else {
                    Api.wxShowToast(res.data.msg, 'none', 2000);
                  }
                })
              }
            })
          }
        })
      }
    } else {
      that.setData({showDialog: true})
    }
  },
  showMoreList (e) {
    let that = this;
    let ladders = that.data.ladders;
    let datas = ladders.data;
    let idx = e.currentTarget.dataset.index;
    app.aldstat.sendEvent(`模板2点击查看更多获奖名单,当前活动id为${that.data.activityId}`,{
      play : ""
    });
    datas[idx].showMore = true;
    ladders.data = datas;
    that.setData({ladders: ladders})
  },
  hideMoreList (e) {
    let that = this;
    let ladders = that.data.ladders
    let datas = ladders.data;
    let idx = e.currentTarget.dataset.index;
    app.aldstat.sendEvent(`点击收起名单,当前活动id为${that.data.activityId}`,{
      play : ""
    });
    datas[idx].showMore = false;
    ladders.data = datas;
    that.setData({ladders: ladders})
  },
  onTurnTap: function (e) {
    let that = this;
    let pageData = that.data;
    let activityId = pageData.activityId;
    let rewardCount = pageData.rewardCount;
    let btnDisabled = pageData.disabled;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      if (!btnDisabled) {
        if (rewardCount*1>0) {
          that.setData({rewardCount: rewardCount*1-1, disabled: true});
          wx.showLoading();
          let rewardLotteryApi = backApi.rewardLotteryApi+pageData.token;
          fun.quest(rewardLotteryApi, 'POST', {activity_id: activityId},(res)=>{
            if (res) {
              app.aldstat.sendEvent(`模板2点击转盘抽奖`,{
                play : ""
              });
              wx.hideLoading();
              /** 获取到中奖结果后，转盘才开始启动 */
              let duration = 6000; //转盘时长
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
                  prizeObj: res.prize, showGetPrize: true
                });
                let rewardDataApi = backApi.rewardDataApi+pageData.token;
                fun.quest(rewardDataApi, 'GET', {activity_id: activityId}, (res)=>{
                  if (res) {
                    let datas = res;
                    that.setData({prizeRecord: datas.prize_record, rewardCount: datas.reward_count,
                      myPrizes: datas.my_prize_record
                    });
                  }
                })
              }, duration)
            } else {
              wx.hideLoading();
            }
          })
        } else {
          Api.wxShowToast('机会用完了，快去邀请好友吧', 'none', 2000);
        }
      } else {
        Api.wxShowToast('抽奖中，请勿频繁操作~', 'none', 2000);
      }
    } else {
      that.setData({showDialog: true})
    }
  },
  hidePhone () {
    this.setData({showMask: false})
  },
  goSucc () {
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      wx.navigateTo({
        url: `/pages/invitePrize/invitePrize?activityId=${this.data.activityId}&isReserve=1`
      })
    } else {
      this.setData({showDialog: true})
    }
  },
  lookYourGift (e) {
    let item = e.currentTarget.dataset.item;
    let pname = item.prize_name;
    this.setData({pname: pname, showYourPrize: true});
  },
  lookYourGiftRecord (e) {
    let rname = e.currentTarget.dataset.rname;
    this.setData({pname: rname, showYourPrize: true});
  },
  hideYourPrize () {
    this.setData({showYourPrize: false});
  },
  rewardComplete () {
    this.setData({showGetPrize: false, showYourPrize: false});
  }
})
