
const backApi = require('utils/util');
const Api = require('utils/wxApi');
var aldstat = require("utils/ald-stat.js");

App({
  globalData: {
    userInfo: {},
    height: 0,
    winHeight: 0,
    share: false,
    token: '',
    platform: '',
    screenHeight: 0,
    backApi: {}
  },
  onLaunch: function () {
    wx.getSystemInfo({
     success: (res) => {
       this.globalData.platform = res.platform.toUpperCase();
       this.globalData.height = res.statusBarHeight;
       this.globalData.winHeight = res.windowHeight;
       this.globalData.screenHeight = res.screenHeight;
     }
   });
  },
  onShow (options) {
    let that = this;
    let scene = options.scene*1;
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate);
    })
    updateManager.onUpdateReady(function () {
      updateManager.applyUpdate()
    })
    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })
    if (scene === 1089) {
      setTimeout(()=>{
        let pinActivityId = wx.getStorageSync('pinActivityId');
        let token = wx.getStorageSync('token');
        let phoneReserveApi = backApi.phoneReserveApi + token;
        if (pinActivityId) {
          Api.wxRequest(phoneReserveApi, 'POST', {activity_id: pinActivityId, scene: '1089', sign: 'add'}, (res)=>{
            console.log(res)
          })
        }
      }, 200)
    }
    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        wx.setStorageSync('code', code);
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            wx.setStorageSync('token', token);
          } else {
            Api.wxShowToast('token获取失败~', 'none', 2000);
          }
        })
      }
    });
  },
  onLoad (options) {
    console.log(options.scene, 'app')
    let scene = options.scene*1;
    if (scene === 1007 || scene === 1008) {
      this.globalData.share = true
    } else {
      this.globalData.share = false
    }
  }
})
