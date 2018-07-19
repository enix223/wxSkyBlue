// pages/device/settings.js

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let settings = app.globalData.settings

    let modes = [
      { name: '16进制 HEX模式', value: '0', checked: settings.mode === 'hex' },
      { name: 'ASCII 模式', value: '1', checked: settings.mode !== 'hex' }
    ]

    this.setData({
      modes: modes,
      showTime: settings.showTime,
      inSpace: settings.inSpace,
      outSpace: settings.outSpace,
      timerInterval: settings.timerInterval || 1000
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log(app.globalData)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  modeChange (e) {
    var radioItems = this.data.modes
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].value == e.detail.value
    }

    this.setData({
      modes: radioItems
    })

    app.globalData.settings.mode = radioItems[0].checked ? 'hex' : 'ascii'
  },

  changeShowTime (e) {
    let show = !this.data.showTime
    this.setData({
      showTime: show
    })

    app.globalData.settings.showTime = show
  },

  changeInSpace (e) {
    let flag = !this.data.inSpace
    this.setData({
      inSpace: flag
    })

    app.globalData.settings.inSpace = flag
  },

  changeOutSpace (e) {
    let flag = !this.data.outSpace
    this.setData({
      outSpace: flag
    })

    app.globalData.settings.outSpace = flag
  },

  intervalChanged (e) {
    let timerInterval = e.detail.value
    if (!(new RegExp('^[0-9]+$')).test(timerInterval)) {
      wx.showToast({
        title: '请输入整数',
        icon: 'none'
      })
      return
    }

    app.globalData.settings.timerInterval = parseInt(timerInterval)
  }
})