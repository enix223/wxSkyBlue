// pages/device/session.js
const underscore = require('../../utils/underscore.js')
const moment = require('../../utils/moment.js')
const util = require('../../utils/util.js')

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholder: '需要发送的HEX数据',
    content: '',
    sendContent: '',
    notify: false,
    showTime: true,
    properties: {
      write: false,
      read: false,
      notify: false
    },
    hexMode: true,
    outSpace: false,
    inSpace: true,
    timerRunning: false,
    interval: 1000
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.characteristicId = options.characId
    this.serviceId = options.serviceId
    this.deviceId = options.deviceId
    let charc = app.globalData.characteristic

    let settings = app.globalData.settings
    this.setData({
      notify: charc.notify || false,
      properties: charc.properties,
      sendContent: charc.sendContent || ''
    })

    wx.onBLECharacteristicValueChange((res) => {
      this.refreshContent(res.value, 'R')
    })

    wx.onBLEConnectionStateChange((res) => {
      if (!res.connected) {
        wx.showToast({
          title: '设备链接断开',
          icon: 'none'
        })

        setTimeout(() => {
          wx.navigateBack({
            delta: 2
          })
        }, 1500)
      }
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
    let settings = app.globalData.settings
    this.setData({
      placeholder: settings.mode === 'hex' ? 'HEX进制数据' : 'ASCII数据',
      hexMode: settings.mode === 'hex',
      showTime: settings.showTime,
      outSpace: settings.outSpace,
      inSpace: settings.inSpace,
      interval: settings.timerInterval || 1000
    })
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
    if (this.timer) {
      clearInterval(this.timer)
    }
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

  setNotify (e) {
    if (!(this.data.properties.indicate || this.data.properties.notify)) {
      wx.showToast({
        title: '不支持订阅操作',
        icon: 'none'
      })
      return
    }

    wx.notifyBLECharacteristicValueChange({
      deviceId: this.deviceId,
      serviceId: this.serviceId,
      characteristicId: this.characteristicId,
      state: !this.data.notify,
      success: (res) => {
        let notify = !this.data.notify
        app.globalData.characteristic.notify = notify
        console.log(`notify changed. [${notify}]`)
        this.setData({
          notify: notify
        })
      },
      fail: (res) => {
        wx.showToast({
          title: `订阅失败 [${res.errMsg}]`,
          icon: 'none'
        })
      }
    })
  },

  bindBlur (e) {
    this.data.sendContent = e.detail.value
  },

  write (e) {
    if (!this.data.properties.write) {
      wx.showToast({
        title: '不支持写操作',
        icon: 'none'
      })
      return
    }

    app.globalData.characteristic.sendContent = this.data.sendContent

    let buf = util.str2Buffer(this.data.sendContent, 
                              this.data.hexMode,
                              this.data.outSpace)
    if (buf === null) {
      wx.showToast({
        title: '发送数据的格式有误',
        icon: 'none'
      })
      return
    }

    wx.writeBLECharacteristicValue({
      deviceId: this.deviceId,
      serviceId: this.serviceId,
      characteristicId: this.characteristicId,
      value: buf,
      success: (res) => {
        console.log(`data sent. [${res.errMsg}]`)

        this.refreshContent(buf, 'W')
      },
    })
  },

  refreshContent (buf, direction) {
    let content = this.data.content
    if (this.data.showTime) {
      content += `[${moment().format('hh:mm:ss.SSSSS')},${direction}] `
    }

    if (this.data.hexMode) {
      let sep = this.data.inSpace ? ' ' : ''
      content += util.buf2Hex(buf, sep).toUpperCase() + '\r\n'
    } else {
      content += util.buf2String(buf) + '\r\n'
    }

    this.setData({
      content: content
    })
  },

  format (e) {
    wx.navigateTo({
      url: '/pages/device/settings',
    })
  },

  read (e) {
    if (!this.data.properties.read) {
      wx.showToast({
        title: '不支持读操作',
        icon: 'none'
      })
      return
    }

    wx.readBLECharacteristicValue({
      deviceId: this.deviceId,
      serviceId: this.serviceId,
      characteristicId: this.characteristicId,
      success: (res) => {

      },
      fail: (res) => {
        console.error(res)
        wx.showToast({
          title: `读取失败 [${res.errMsg}]`,
          icon: 'none'
        })
      }
    })
  },

  timerDidTap (e) {
    if (this.data.timerRunning) {
      // stop timer
      clearInterval(this.timer)
      this.setData({
        timerRunning: false
      })
    } else {
      // start timer
      if (!this.data.properties.write) {
        return
      }

      let buf = util.str2Buffer(this.data.sendContent,
                                this.data.hexMode,
                                this.data.outSpace)
      if (buf === null) {
        wx.showToast({
          title: '发送数据的格式有误',
          icon: 'none'
        })
        return
      }

      this.timer = setInterval(() => {
        this.write()
      }, this.data.interval)

      this.setData({
        timerRunning: true
      })
    }
  }
})