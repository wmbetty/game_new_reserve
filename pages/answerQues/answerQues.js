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
    questions: {},
    showResultFirst: false,
    showResult: false,
    record: [],
    showRecord: false,
    choiceAnswer: '',
    isCorrect: '',
    idx: -1,
    noQues: false,
    todayQues: {},
    istoday: true
  },
  onLoad: function (options) {
    let that = this;
    that.setData({activityId: options.activityId});
    app.aldstat.sendEvent(`进入答题页面，当前活动id为${options.activityId}`,{
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
            let questionApi = backApi.questionApi+token;
            fun.quest(questionApi, 'GET', {activity_id: options.activityId}, (res)=>{
              if (res) {
                let datas = res;
                if (datas.answer) {
                  that.setData({todayQues: datas.answer, todayQuestionId: datas.answer.activity_id, showChoice: true})
                } else {
                  that.setData({noQues: true})
                }
                that.setData({record: datas.record})
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
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  chooseAnswer (e) {
    let that = this;
    let pageDatas = that.data;
    let answer = e.currentTarget.dataset.answer;
    let phoneReserveApi = backApi.phoneReserveApi+pageDatas.token;
    let encryptCode = pageDatas.todayQues.encrypt_code;
    let rdata = {
      activity_id: pageDatas.activityId,
      encrypt_code: encryptCode,
      choice_answer: answer,
      sign: 'answer'
    }

    fun.taskMake(phoneReserveApi, 'POST', rdata, (res)=>{
      if (res.data.status*1===200) {
        let isCorrect = res.data.data.is_correct;
        that.setData({showResult: true, choiceAnswer: answer, isCorrect: isCorrect, showChoice: false})
      } else {
        Api.wxShowToast(res.data.msg, 'none', 2000);
      }
    })
    let questionApi = backApi.questionApi+pageDatas.token;
    fun.quest(questionApi, 'GET', {activity_id: pageDatas.activityId}, (res)=>{
      if (res) {
        let datas = res;
        that.setData({record: datas.record})
      }
    })
    app.aldstat.sendEvent(`答题页点击-${answer}`,{
      play : ""
    });
  },
  goPrize () {
    app.aldstat.sendEvent(`答对题后进入抽奖页`,{
      play : ""
    });
    wx.navigateTo({
      url: '/pages/getGift/getGift?activityId='+this.data.activityId
    })
  },
  lookQues (e) {
    let that = this;
    let pageData = that.data;
    let dataset = e.currentTarget.dataset;
    let rid = dataset.rid;
    let idx = dataset.index;

    if (idx*1+1) {
      that.setData({idx: idx, showRecord: true, istoday: false});
    } else {
      that.setData({showRecord: false, istoday: true, idx: -1});
    }

    let questionApi = backApi.questionApi+pageData.token;
    fun.quest(questionApi, 'GET', {activity_id: pageData.activityId, record_id: rid}, (res)=>{
      if (res) {
        let datas = res;
        that.setData({questions: datas.answer})
      }
    })
    app.aldstat.sendEvent(`查看答题记录第${index*1+1}题`,{
      play : ""
    });
  }
})
