const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
const app = getApp();

Page({
  data: {
    type: 1,
    token: '',
    page: 1,
    topics: [],
    showDialog: false,
    userInfo: {},
    types: [],
    showFixedTab: false,
    height: 0,
    showEmpty: false
  },
  onLoad: function (options) {
    let that = this;
    let height = app.globalData.height;
    that.setData({height: height})
  },
  onReady: function () {},
  onShow: function () {
    let that = this;
    that.setData({type: 1});
    app.aldstat.sendEvent(`进入我的页面`,{
      play : ""
    });
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      that.setData({userInfo: userInfo})
      let loginApi = backApi.loginApi;
      wx.login({
        success: function(res) {
          let code = res.code;
          fun.quest(loginApi, 'POST', {code: code}, (res)=>{
            if (res) {
              let token = res.access_token;
              that.setData({token: token});
              let userApi = backApi.userApi+token;
              wx.showLoading();
              fun.quest(userApi, 'GET', {type_id: that.data.type, page: 1}, (res)=>{
                if (res) {
                  wx.hideLoading();
                  let types = res.type;
                  let datas = res.data;
                  that.setData({types: types});
                  if (datas.length===0) {
                    that.setData({showEmpty: true})
                  } else {
                    that.setData({topics: datas, showEmpty: false})
                  }
                } else {
                  wx.hideLoading();
                }
              })
            }
          })
        }
      })
    } else {
      this.setData({showDialog:true})
    }
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let pageData = that.data;
    let page = pageData.page*1+1;
    let type = pageData.type;
    let topics = pageData.topics;
    let userApi = backApi.userApi+pageData.token;
    wx.showLoading();
    fun.quest(userApi, 'GET', {type_id: type, page: page}, (res)=>{
      if (res) {
        wx.hideLoading();
        app.aldstat.sendEvent(`我的页面下拉查看，当前type为${type}`,{
          play : ""
        });
        let datas = res.data;
        that.setData({page: page});
        if (datas.length===0) {
          Api.wxShowToast('没有更多了~', 'none', 2000);
        } else {
          topics = topics.concat(datas);
          that.setData({topics: topics})
        }
      } else {
        wx.hideLoading();
      }
    })
  },
  onShareAppMessage: function () {
    return {
        path: `/pages/index/index`
      }
  },
  changeTab (e) {
    let that = this;
    let type = e.currentTarget.dataset.type*1;
    that.setData({type: type});
    let userApi = backApi.userApi+that.data.token;
    app.aldstat.sendEvent(`我的页面tab切换，当前type为${type}`,{
      play : ""
    });
    wx.showLoading();
    fun.quest(userApi, 'GET', {type_id: type, page: 1}, (res)=>{
      if (res) {
        wx.hideLoading();
        let datas = res.data;
        that.setData({page: 1});
        if (datas.length===0) {
          that.setData({showEmpty: true})
        } else {
          that.setData({topics: datas, showEmpty: false})
        }
      } else {
        wx.hideLoading();
      }
    })
  },
  cancelDialog () {
    this.setData({showDialog:false})
  },
  confirmDialog (e) {
    let that = this;
    let loginApi = backApi.loginApi;
    that.setData({
      showDialog: false
    });
    wx.login({
      success: function (res) {
        let code = res.code;
        fun.quest(loginApi, 'POST', {code: code}, (res)=>{
          if (res) {
            let token = res.access_token;
            that.setData({token: token});
            let updateUserInfoApi = backApi.updateUserInfoApi+token;
            wx.getUserInfo({
              success: (res)=>{
                let encryptedData = res.encryptedData;
                let iv = res.iv;
                wx.login({
                  success: function (res) {
                    let code = res.code;
                    let userData = {
                      encryptedData: encryptedData,
                      iv: iv,
                      code: code
                    }
                    fun.quest(updateUserInfoApi,'POST',userData,(res)=> {
                      if (res) {
                        wx.setStorageSync('userInfo', res);
                        that.setData({userInfo: res})
                        Api.wxShowToast('授权成功', 'none', 2000);
                        let userApi = backApi.userApi+token;
                        wx.showLoading();
                        fun.quest(userApi, 'GET', {type_id: that.data.type, page: 1}, (res)=>{
                          if (res) {
                            wx.hideLoading();
                            let types = res.type;
                            let datas = res.data;
                            that.setData({types: types});
                            if (datas.length===0) {
                              that.setData({showEmpty: true})
                            } else {
                              that.setData({topics: datas, showEmpty: false})
                            }
                          } else {
                            wx.hideLoading();
                          }
                        })
                      }
                    })
                  }
                })
                fail: (res) => {
                  console.log(res,'ss')
                }
              }
            })
          } else {
            Api.wxShowToast('token获取失败', 'none', 2000);
          }
        })
      }
    })
  },
  goTipDetail (e) {
    let id = e.currentTarget.dataset.id;
    app.aldstat.sendEvent(`我的页面点击查看攻略详情，当前id为${id}`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/tipDetails/tipDetails?id=${id}`
    })
  },
  onPageScroll (e) {
    let that = this;
    let winHeight = app.globalData.winHeight;
    if (e.scrollTop*1>=winHeight*0.38) {
      that.setData({showFixedTab: true})
    } else {
      that.setData({showFixedTab: false})
    }
  }
})
