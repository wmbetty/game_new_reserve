// pages/tipdetails/tipdetails.js 攻略图文详情
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const fun = require('../../utils/functions');
let WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    hadTab: false,
    nvabarData: {
      title: '游戏攻略',
      showCapsule: 1
    },
    nvabarData1: {
      title: '游戏攻略',
      showCapsule: 1,
      isQrcodeIn: true
    },
    height: 0,
    winHeight: 0,
    // showMask: false,
    id: '',
    details: {},
    showDialog: false,
    isRedBtn: false,
    comments: [],
    page: 1,
    isQrcodeIn: false
  },
  onLoad: function (options) {
    let that = this;
    if (options.id) {
      that.setData({id: options.id});
      app.aldstat.sendEvent(`进入攻略详情页，当前攻略id为${options.id}`,{
        play : ""
      });
    }
    if (options.scene) {
      that.setData({id: options.scene, isQrcodeIn: true});
      app.aldstat.sendEvent(`通过识别小程序码进入攻略详情页，当前攻略id为${options.scene}`,{
        play : ""
      });
    }
  },
  onReady: function () {},
  onShow: function () {
    let that = this;
    let tipId = that.data.id;
    let height = app.globalData.height;
    that.setData({height: height});
    wx.showLoading();
    setTimeout(()=>{
      let loginApi = backApi.loginApi;
      wx.login({
        success: function(res) {
          let code = res.code;
          Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
            if (res.data.status*1===200) {
              let token = res.data.data.access_token;
              that.setData({token: token});
              let strategyViewApi = backApi.strategyViewApi+token;
              fun.quest(strategyViewApi,'GET',{strategy_id: tipId},(res)=>{
                if (res) {
                  that.setData({details: res});
                  if (res.video_url==='') {
                    that.setData({showVideo: false})
                  } else {
                    that.setData({showVideo: true})
                  }
                  WxParse.wxParse('article', 'html', res.content, that, 0);
                  let gameDetailApi = backApi.gameDetailApi+res.game_id;
                  fun.quest(gameDetailApi,'GET',{'access-token': token},(res)=>{
                    if (res) {
                      that.setData({gameDetils: res});
                    }
                  })
                }
              })
              let commentListApi = backApi.commentListApi+token;
              fun.quest(commentListApi,'GET',{strategy_id: tipId, page: 1},(res)=>{
                if (res) {
                  wx.hideLoading();
                  let datas = res;
                  if (datas.length===0) {
                    that.setData({showEmpty: true});
                  } else {
                    that.setData({comments: datas, showEmpty: false});
                  }
                } else {
                  wx.hideLoading();
                }
              })
            } else {
              console.log('token获取失败')
            }
          })
        }
      })

    },800)
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let pdata = that.data;
    let page = pdata.page*1+1;
    let comments = pdata.comments;
    let showEmpty = pdata.showEmpty;
    if (!showEmpty && comments.length>2) {
      let commentListApi = backApi.commentListApi+pdata.token;
      wx.showLoading();
      app.aldstat.sendEvent(`攻略详情页下拉查看，当前攻略id为${pdata.id}`,{
        play : ""
      });
      fun.quest(commentListApi,'GET',{strategy_id: pdata.id, page: page},(res)=>{
        if (res) {
          wx.hideLoading();
          that.setData({page: page})
          let datas = res;
          if (datas.length===0) {
            Api.wxShowToast('没有更多了~', 'none', 2000);
          } else {
            comments = comments.concat(datas);
            that.setData({comments: comments});
          }
        } else {
          wx.hideLoading();
        }
      })
    }
  },
  onShareAppMessage: function () {
    let that = this;
    let pdata = that.data;
    let tipId = pdata.id;
    app.aldstat.sendEvent(`分享攻略详情页，当前攻略id为${tipId}`,{
      play : ""
    });
    return {
      title: pdata.details.title,
      path: `/pages/index/index?tipId=${tipId}`
    }
  },
  goComment () {
    app.aldstat.sendEvent(`攻略详情页点击评论，当前攻略id为${this.data.id}`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/comment/comment`
    })
  },
  goPublish () {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      app.aldstat.sendEvent(`攻略详情页点击发布按钮，当前攻略id为${that.data.id}`,{
        play : ""
      });
      wx.navigateTo({
        url: `/pages/publish/publish`
      })
    } else {
      that.setData({showDialog:true})
    }
  },
  goPraise () {
    let that = this;
    let pdata = that.data;
    let id = pdata.id;
    let isRedBtn = pdata.isRedBtn;
    let praiseApi = backApi.strategyPraiseApi+pdata.token;
    let userInfo = wx.getStorageSync('userInfo');
    let details = pdata.details;
    if (userInfo.id) {
      if (!isRedBtn) {
        wx.showLoading();
        app.aldstat.sendEvent(`攻略点赞，当前攻略id为${id}`,{
          play : ""
        });
        fun.taskMake(praiseApi,'POST',{strategy_id: id},(res)=>{
          if (res.data.status*1===200) {
            wx.hideLoading();
            details.total_praise = details.total_praise*1+1;
            Api.wxShowToast('点赞成功~', 'none', 2000);
            that.setData({isRedBtn: true, details: details});
          } else {
            wx.hideLoading();
              Api.wxShowToast('点赞失败~', 'none', 2000);
          }
        })
      } else {
        Api.wxShowToast('点过赞咯~', 'none', 2000);
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
            fun.quest(updateUserInfoApi,'POST',userData,(res)=> {
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
  gotoReply (e) {
    let that = this;
    let dataset = e.currentTarget.dataset;
    let id = dataset.id;
    let name = dataset.name;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      app.aldstat.sendEvent(`回复某条评论，当前评论id为${id}`,{
        play : ""
      });
      wx.navigateTo({
        url: `/pages/comment/comment?id=${id}&name=${name}&sid=${that.data.id}`
      })
    } else {
      that.setData({showDialog:true})
    }
  },
  gotoComment (e) {
    let that = this;
    let pdata = that.data;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo.id) {
      app.aldstat.sendEvent(`攻略评论，当前攻略id为${pdata.id}`,{
        play : ""
      });
      wx.navigateTo({
        url: `/pages/comment/comment?sid=${pdata.id}&sname=${pdata.details.title}`
      })
    } else {
      that.setData({showDialog:true})
    }
  },
  gotoPraise (e) {
    let that = this;
    let pdata = that.data;
    let dataset = e.currentTarget.dataset;
    let idx = dataset.index;
    let good = dataset.good;
    let list = pdata.comments;
    let userInfo = wx.getStorageSync('userInfo');
    let praiseApi = backApi.praiseApi+pdata.token;
    if (userInfo.id) {
      if (!good) {
        app.aldstat.sendEvent(`点赞某条评论，当前评论id为${list[idx].id}`,{
          play : ""
        });
        fun.taskMake(praiseApi,'POST',{comment_id: list[idx].id},(res)=>{
          if (res.data.status*1===200) {
            list[idx].isGood = true;
            list[idx].isLike = true;
            list[idx].total_praise = list[idx].total_praise*1+1;
            that.setData({
              comments: list
            })
          } else {
            Api.wxShowToast(res.data.msg, 'none', 2000);
          }
        })

      } else {
        Api.wxShowToast('点过赞了哦~', 'none', 2000);
      }
    } else {
      that.setData({showDialog:true})
    }
  },
  gotoGame (e) {
    let id = e.currentTarget.dataset.id;
    app.aldstat.sendEvent(`攻略详情页点击某个游戏专区，当前游戏id为${id}`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/singleGame/singleGame?id=${id}`
    })
  }
})
