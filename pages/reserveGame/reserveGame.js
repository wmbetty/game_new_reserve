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
    showMask: false,
    showToast: false
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

            if(options.scene){
              let scene = decodeURIComponent(options.scene);
              //&是我们定义的参数链接方式
              let scenes = options.scene.split("&");
              if (scenes.length===2) {
                let activityId = scenes[0];
                app.aldstat.sendEvent(`通过小程序码进入预约页面(预约模板1)，当前活动id为${activityId}`,{
                  play : ""
                });
                that.setData({activityId: activityId, isQrcodeIn: true});
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
                    console.log('邀请成功，获得一次抽奖机会');
                    wx.setStorageSync('encryptId', '');
                  } else {
                    console.log(res.data.msg)
                  }
                })
              }
            }

            let source = options.source;
            if (source==='platform') {
              // 平台对接逻辑
              let activityId = options.activityId;
              let activityViewApi = backApi.activityViewApi+token;
              fun.quest(activityViewApi, 'GET', {activity_id: activityId}, (res)=>{
                if (res) {
                  that.setData({activity: res, isQrcodeIn: true, activityId: activityId});
                  if (res.is_booking*1!==1) {
                    that.setData({showToast: true, showMask: true});
                  } else {
                    that.setData({showToast: false, showMask: false});
                    Api.wxShowToast('已验证过手机预约~', 'none', 2000);
                    setTimeout(()=>{
                      let openReward = res.open_reward*1;
                      if (openReward===1) {
                        wx.navigateTo({
                          url: '/pages/getGift/getGift?activityId='+activityId.activityId
                        })
                      }
                    },1200)
                  }
                }
              })
            }

          } else {
            Api.wxShowToast('token获取失败~', 'none', 2000);
          }
        })
      }
    });

    let platform = app.globalData.platform;
    if (platform === 'IOS') {
      that.setData({isAndrod: false})
      app.aldstat.sendEvent(`ios进入预约页面(模板1)`,{
        play : ""
      });
    } else {
      app.aldstat.sendEvent(`安卓进入预约页面(模板1)`,{
        play : ""
      });
    }
    if (options.activityId) {
      that.setData({activityId: options.activityId});
      app.aldstat.sendEvent(`进入预约游戏页面(模板1)，当前活动id为${options.activityId}`,{
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

    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            let activityViewApi = backApi.activityViewApi+token;
            fun.quest(activityViewApi, 'GET', {activity_id: that.data.activityId}, (res)=>{
              if (res) {
                that.setData({activity: res});
                if (res.is_booking*1!==1) {
                  that.setData({showNoReserve: true});
                }
              }
            })
          } else {
            console.log('token获取失败')
          }
        })
      }
    })

    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      that.setData({showDialog:false})
    } else {
      that.setData({showDialog:true})
    }
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    app.aldstat.sendEvent(`分享预约游戏页面(模板1)，当前活动id为${this.data.activityId}`,{
      play : ""
    });
    return {
      title: this.data.activity.friend_lang,
      imageUrl: this.data.activity.friend_url,
      path: `/pages/index/index?activityId=${this.data.activityId}&reserveMode=${1}`
    }
  },
  // goReserve () {
  //   let that = this;
  //   let phone = that.data.phone;
  //   let code = that.data.verifyCode;
  //   if (phone==='') {
  //     Api.wxShowToast('请输入手机号', 'none', 2000);
  //     return false;
  //   }
  //   if (code==='') {
  //     Api.wxShowToast('请输入验证码', 'none', 2000);
  //     return false;
  //   }
  // },
  choosePlat (e) {
    let that = this;
    let type = e.currentTarget.dataset.type*1;
    if (type===1) {
      that.setData({isAndrod: true})
      app.aldstat.sendEvent(`模板1预约游戏页面选择安卓，当前活动id为${that.data.activityId}`,{
        play : ""
      });
    } else {
      app.aldstat.sendEvent(`模板1预约游戏页面选择苹果，当前活动id为${that.data.activityId}`,{
        play : ""
      });
      that.setData({isAndrod: false})
    }
  },
  getPhoneNumber (e) {
    let that = this;
    // let errMsg = e.detail.errMsg;
    app.aldstat.sendEvent(`模板1获取手机号,当前活动id为${that.data.activityId}`,{
      play : ""
    });
    if (e.detail.encryptedData) {
      wx.login({
        success: function (res) {
          let code = res.code;
          let phoneNumberApi = backApi.phoneNumberApi+'?access-token='+that.data.token;
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
    let phoneReserveApi = backApi.phoneReserveApi+pageData.token;
    if (phone==='') {
      Api.wxShowToast('请输入手机号', 'none', 2000);
      return false
    }
    if(!(/^1[3456789]\d{9}$/.test(phone))){
        Api.wxShowToast('手机格式不正确', 'none', 2000);
        return false;
    }
    // that.setData({showConfirmBtn: true})
    let reserveData = {
      activity_id: pageData.activityId,
      phone: phone,
      type: type,
      sign: 'booking'
    }
    fun.taskMake(phoneReserveApi, 'POST', reserveData, (res)=>{
      if (res.data.status*1===200) {
        that.setData({reserveSuccess: true, showPhone: false})
        // Api.wxShowToast('手机预约成功', 'none', 2000);
        app.aldstat.sendEvent(`模板1预约成功,当前活动id为${pageData.activityId}`,{
          play : ""
        });
      } else {
        Api.wxShowToast(res.data.msg, 'none', 2000);
      }
    })
  },
  getPrize () {
    let that = this;
    app.aldstat.sendEvent(`模板1预约完成去抽奖，当前活动id为${that.data.activityId}`,{
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
    if (userInfo.id) {
      that.setData({showPhone: true, showReserve: false, showNoReserve: false})
    } else {
      that.setData({showDialog:true, showNoReserve: false})
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
  verifyPhone (e) {
    let that = this;
    let pageData = that.data;
    // let errMsg = e.detail.errMsg;
    app.aldstat.sendEvent(`预约模板1平台对接页面按钮点击,当前活动id为${pageData.activityId}`,{
      play : ""
    });
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
                  setTimeout(()=>{
                    that.setData({showMask: false});
                    let openReward = pageData.activity.open_reward*1;
                    if (openReward===1) {
                      wx.navigateTo({
                        url: '/pages/getGift/getGift?activityId='+pageData.activityId
                      })
                    }
                  },1200)
                } else {
                  Api.wxShowToast(res.data.msg, 'none', 2000);
                }
              })
            }
          })
        }
      })
    }
  },
  hideMask () {
    this.setData({showMask: false})
  }
})
