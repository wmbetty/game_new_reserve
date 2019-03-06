// components/navbar/index.js
const app = getApp()
Component({
  properties: {
    navbarData: {   //navbarData   由父页面传递的数据，变量名字自命名
      type: Object,
      value: {},
      observer: function (newVal, oldVal) {}
    }
  },
  data: {
    height: '',
    //默认值  默认显示左上角
    navbarData: {
      showCapsule: 1,
      showLogo: false,
      isQrcodeIn: false,
      noBgColor: false,
      backIsCircle: false,
      isActivityIn: false
    }
  },
  attached: function () {
    // 获取是否是通过分享进入的小程序
    this.setData({
      share: app.globalData.share
    })
    // 定义导航栏的高度   方便对齐
    this.setData({
      height: app.globalData.height
    })
  },
  methods: {
  // 返回上一页面
    _navback() {
      let that = this;
      let isQrcodeIn = that.data.navbarData.isQrcodeIn;
      let isActivityIn = that.data.navbarData.isActivityIn;

      if (isActivityIn) {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
      if (isQrcodeIn) {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
      if (!isActivityIn && !isQrcodeIn) {
        wx.navigateBack()
      }

    },
  //返回到首页
    _backhome() {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  }

})
