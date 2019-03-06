// components/fixedBtn/fixedBtn.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hadTab: {
      type: Boolean,
      default: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    goPublish () {
      wx.navigateTo({
        url: `/pages/publish/publish`
      })
    }
  }
})
