const backApi = require('../utils/util');
const Api = require('../utils/wxApi');

function taskMake(api, method, paramData={}, callback) {
  Api.wxRequest(api,method,paramData,(res)=>{
    callback(res)
  })
}

function quest(api, method, paramData={}, callback) {
  Api.wxRequest(api,method,paramData,(res)=>{
    if (res.data.status*1===200) {
      let datas = res.data.data;
      callback(datas)
    } else {
      if (res.data.msg) {
        // Api.wxShowToast(res.data.msg, 'none', 2000);
        console.log(res.data.msg)
      } else {
        Api.wxShowToast('出错了~', 'none', 2000);
      }
    }
  })
}

function wxLogin() {
  let loginApi = backApi.loginApi;
  return new Promise((resolve, reject) => {
    wx.login({
      success: function(res) {
        let code = res.code;
        quest(loginApi, 'POST', {code: code}, (res)=>{
          if (res) {
            let token = res.access_token;
            resolve(token)
          }
        })
      }
    })
  })
}


module.exports = {
  taskMake: taskMake,
  quest: quest,
  wxLogin: wxLogin
}
