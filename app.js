//app.js
App({
  onLaunch: function () {
    // load settings
    let settings = wx.getStorageSync('settings') || {
      mode: 'hex',
      showTime: true,
      outSpace: false,
      inSpace: true
    }

    this.globalData.settings = settings
  },

  onShow () {
    this.initBLE()
  },

  onHide () {
    this.deInitBLE()
    wx.setStorageSync('settings', this.globalData.settings)
  },

  globalData: {
  },

  deInitBLE() {
    wx.closeBluetoothAdapter({
      success: (res) => {
        console.log(res)
      },
      fail: (res) => {
        console.error(res)
      }
    })
  },

  initBLE() {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log(res)
        if (this.onBLEReady) {
          this.onBLEReady(res)
        }
      },
      fail: (res) => {
        console.error(res)
      }
    })
  }
})