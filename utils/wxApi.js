
function wxShowToast(title, icon, duration) {
  wx.showToast({
    title: title,
    icon: icon,
    duration: duration
  })
}

function wxShowModal(title, txt, showCancel, callback) {
  wx.showModal({
    confirmText: '确认',
    title: title,
    content: txt,
    confirmColor: '#18A3FE',
    showCancel: showCancel,
    success: (res) => {
      callback(res)
    }
  })
}

function wxRequest(url, method, data={}, callback) {
  wx.request({
    url: url,
    method: method,
    data: data,
    header: {
      'content-type': 'application/json' // 默认值
      // 'content-type': 'application/x-www-form-urlencoded'
    },
    success: (res) => {
      callback(res)
    },
    fail: (res) => {
      console.log(res)
    }
  })
}

module.exports = {
  wxRequest: wxRequest,
  wxShowToast: wxShowToast,
  wxShowModal: wxShowModal
}
