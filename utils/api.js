
const search = (key) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg?is_xml=0&format=jsonp&key=${key}g_tk=5381&jsonpCallback=SmartboxKeysCallbackmod_top_search3847&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`,
      data: {
        is_xml: 0,
        format: 'jsonp',
        key: key,
        g_tk: 5381,
        jsonpCallback: 'SmartboxKeysCallbackmod_top_search3847',
        loginUin: 0,
        hostUin: 0,
        format: 'jsonp',
        inCharset: 'utf8',
        outCharset: 'utf-8',
        notice: 0,
        platform: 'yqq',
        needNewCode: 0
      },
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

const getSongDetails = (mid) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://music.niubishanshan.top/api/music/songUrllist/' + mid,
      method: 'GET',
      dataType: 'json',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        resolve(res);
      },
      fail(error) {
        reject(error);
      }
    })
  })
}

const request = {
  get: (url) => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://music.niubishanshan.top/api/music' + url,
        method: 'GET',
        dataType: 'json',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          resolve(res);
        },
        fail(error) {
          reject(error);
        }
      })
    })
  },
  post: (url, data) => {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://music.niubishanshan.top/api/music' + url,
        method: 'POST',
        data: data,
        dataType: 'json',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          resolve(res);
        },
        fail(error) {
          reject(error);
        }
      })
    })
  }
}

// 提示框
const openAlert = (content) => {
  wx.showModal({
    content: content,
    showCancel: false,
    success: function (res) {
      if (res.confirm) {
        // console.log('用户点击确定')
      }
    }
  });
}

module.exports = {
  search: search,
  getSongDetails: getSongDetails,
  request: request,
  openAlert: openAlert
}