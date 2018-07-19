// pages/device/info.js
const underscore = require('../../utils/underscore.js')
const ble = require('../../utils/ble.js')
const util = require('../../utils/util.js')

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    device: null,
    services: [],
    connectTimeout: 3000,
    enumerated: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let idx = options.idx
    let dev = app.globalData.devices[idx]
    this.deviceId = options.deviceId
    dev.advertisDataHex = util.buf2Hex(app.globalData.devices[idx].advertisData)
    this.setData({
      device: dev
    })

    wx.onBLEConnectionStateChange((res) => {
      if (!res.connected) {
        wx.showToast({
          title: '设备链接断开',
          icon: 'none'
        })

        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.connectDevice(this.deviceId)
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
    wx.closeBLEConnection({
      deviceId: this.deviceId,
      success: function(res) {},
    })
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

  copyThis (e) {
    wx.showActionSheet({
      itemList: ['复制'],
      success: (res) => {
        if (res.tapIndex == 0) {
          wx.setClipboardData({
            data: this.data.device[e.currentTarget.dataset.id],
            success: (res) => {
              wx.showToast({
                title: '已复制到剪贴板'
              })
            }
          })
        }
      }
    })
  },

  connectDevice (deviceId) {
    wx.onBLEConnectionStateChange((res) => {
      console.log(`Device ${res.deviceId} connected: ${res.connected}`)
      if (res.deviceId === this.deviceId && res.connected) {
        this.enumerateDevice({
          deviceId: deviceId,
          fail: (reason) => {
            console.error(reason)
            wx.showToast({
              title: '链接设备失败',
              icon: 'none'
            })
          }
        })
      }
    })

    wx.createBLEConnection({
      deviceId: deviceId,
      timeout: this.connectTimeout,
      success: (res) => {
        console.log(res)
      },
      fail: (res) => {
        console.error(res)
        wx.showToast({
          title: '连接设备失败',
          icon: 'none'
        })
      }
    })
  },

  enumerateDevice (options) {
    let deviceId = options.deviceId
    let fail = options.fail
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: (res) => {
        this.setData({
          services: res.services
        })

        for (let service of res.services) {
          wx.getBLEDeviceCharacteristics({
            deviceId: deviceId,
            serviceId: service.uuid,
            success: (res) => {
              let innerService = underscore.find(this.data.services, (item) => item.uuid === service.uuid)
              let characs = res.characteristics.map((item) => {
                item.desc = ble.BLE_CHARAC_MAPPING[item.uuid.substring(4, 8)] || item.uuid
                return item
              })
              innerService.characteristics = characs
              innerService.discoverred = true
              innerService.desc = ble.BLE_SERVICE_MAPPING[innerService.uuid.substring(4, 8)] || innerService.uuid

              if (this.checkEnumeratedDone()) {
                console.log('enumerated done')
                this.setData({
                  services: this.data.services,
                  enumerated: true
                })
              }
            },
            fail: fail
          })
        }
      },
      fail: fail
    })
  },

  checkEnumeratedDone () {
    for (let service of this.data.services) {
      if (service.discoverred === undefined) {
        return false
      }
    }

    return true
  },

  selectCharac (e) {
    let sidx = e.currentTarget.dataset.sid
    let cidx = e.currentTarget.dataset.cid

    let uuid = e.currentTarget.dataset.uuid
    let suuid = e.currentTarget.dataset.serviceid

    app.globalData.characteristic = this.data.services[sidx].characteristics[cidx]

    let url = `/pages/device/session?characId=${uuid}&serviceId=${suuid}&deviceId=${this.deviceId}`
    wx.navigateTo({
      url: url,
    })
  }
})