//index.js
const underscore = require('../../utils/underscore.js')

//获取应用实例
const app = getApp()

Page({
  data: {
    available: false,
    scanning: false,
    duplicate: true,
    services: [],
    interval: 100,
    scanTimeout: 3000,
    devices: [],
    version: 'v1.0.180719',
    mail: 'support@cloudesk.top'
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getBLEState()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    if (this.data.scanning) {
      this.stopScan()
    }
  },

  onLoad: function () {

  },

  onUnload: function () {

  },

  selectDevice (e) {
    let idx = e.currentTarget.dataset.id
    let device = this.data.devices[idx]
    wx.navigateTo({
      url: `/pages/device/info?deviceId=${device.deviceId}&idx=${idx}`
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.scanPeripheral()
  },

  getBLEState () {
    let autoScan = underscore.once(this.scanPeripheral)

    wx.onBluetoothAdapterStateChange((res) => {
      this.setData({
        available: res.available,
        scanning: res.discovering
      })

      if (res.available) {
        autoScan()
      }
    })

    wx.getBluetoothAdapterState({
      success: (res) => {
        this.setData({
          available: res.available,
          scanning: res.discovering
        })

        if (res.available) {
          autoScan()
        }
      },
    })
  },

  scanPeripheral () {
    if (!this.data.available) {
      wx.stopPullDownRefresh()

      setTimeout(() => {
        wx.showToast({
          title: '蓝牙控制器暂时不可用，请确保手机蓝牙已打开',
          icon: 'none'
        })
      }, 500)

      return
    }

    if (this.data.scanning) {
      // Scanning
      wx.stopPullDownRefresh()
      return
    }

    this.setData({
      devices: []
    })
    app.globalData.devices = []

    wx.startPullDownRefresh()

    wx.onBluetoothDeviceFound((res) => {
      let devices = this.data.devices
      for (let dev of res.devices) {
        let found = underscore.find(devices, (item) => {
          return item && item.deviceId === dev.deviceId
        })
        if (found === undefined) {
          devices.push(dev)
        }
      }

      this.setData({
        devices: devices
      })

      app.globalData.devices = devices
    })

    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: this.data.duplicate,
      services: this.data.services,
      interval: this.data.interval,
      success: (res) => {
        console.log('Scan peripheral started')
      },
      fail: (res) => {
        console.error('Scan peripheral error')
        console.error(res)
        wx.stopPullDownRefresh()
      }
    })

    setTimeout(() => {
      this.stopScan()
    }, this.data.scanTimeout)
  },

  stopScan () {
    wx.stopBluetoothDevicesDiscovery({
      success: (res) => {
        console.log('Peripheral scan stop')
      },
      fail: (res) => {
        console.log('Peripheral scan stop failed.')
        console.error(res)
      },
      complete: () => {
        wx.stopPullDownRefresh()
      }
    })
  }
})
