const api = require('../../utils/api.js')
const songs = require('../../utils/song.js')
const app = getApp().globalData
Page({
  data: {
    hotSearch: [],
    result: false
  },
  onLoad: function () {
    this.dealHistroySearch()
  },
  searchAction: function (event) {
    const keyWrod = event.detail.value || event.currentTarget.dataset.txt
    api.search(keyWrod).then((res) => {
      let res1 = res.data.replace('SmartboxKeysCallbackmod_top_search3847(', '')
      let res2 = JSON.parse(res1.substring(0, res1.length - 1))
      this.dealData(res2.data)
      this.dealHistroySearch(keyWrod)
    }).catch((res) => {
      console.log(res)
    })
  },
  dealData: function (data) {
    if (data) {
      this.setData({
        result: true
      })
      data.singer ? this.setData({
        singers: data.singer.itemlist
      }) : this.setData({
        singers: []
      })
      data.song ? this.setData({
        songs: data.song.itemlist
      }) : this.setData({
        songs: []
      })
    } else {
      this.setData({
        result: false
      })
    }
  },
  dealHistroySearch: function (keyWrod) {
    let histroy
    try {
      let local = wx.getStorageSync('histroySearch')
      if (local) {
        histroy = local
        if (keyWrod && local.indexOf(keyWrod) < 0) {
          local.push(keyWrod)
          wx.setStorage({
            key: "histroySearch",
            data: local
          })
        }
      } else {
        if (keyWrod) {
          histroy = [keyWrod]
          wx.setStorage({
            key: "histroySearch",
            data: [keyWrod]
          })
        }
      }
    } catch (e) {
      console.log(e)
    }
    this.setData({
      histroySearch: histroy.reverse()
    })
  },
  deleteHistroySearch: function (event) {
    const keyWord = event.currentTarget.dataset.txt
    if (keyWord) {
      let local = wx.getStorageSync('histroySearch')
      let index = local.indexOf(keyWord)
      local.splice(index, 1)
      wx.setStorageSync('histroySearch', local)
    } else {
      wx.removeStorageSync('histroySearch')
    }
    this.setData({
      histroySearch: wx.getStorageSync('histroySearch')
    })
  },
  goSinger: function (event) {
    const detail = event.currentTarget.dataset
    app.selectsinger = {}
    app.selectsinger.id = detail.id
    app.selectsinger.avatar = `https://y.gtimg.cn/music/photo_new/T001R300x300M000${app.selectsinger.id}.jpg?max_age=2592000`
    app.selectsinger.name = detail.name
    wx.navigateTo({
      url: '/pages/singer-detail/singer-detail'
    })
  },
  selectSong: function (event) {
    const mid = event.currentTarget.dataset.mid
    // 全局控制是否可以换歌 
    getApp().globalTime.time = 1

    api.getSongDetails(mid).then((res) => {
      // var res1 = res.data.replace('getOneSongInfoCallback(', '')
      // var res2 = JSON.parse(res1.substring(0, res1.length - 1)).data[0]
      let song = {
        // id: res.id,
        mid: mid,
        // singer: songs.filterSinger(res.singer),
        // name: res.name,
        // album: res.album.name,
        // duration: res.interval,
        // image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${res.album.mid}.jpg?max_age=2592000`,
        // musicId: res.id
      }

      app.songlist = [song]
      app.currentIndex = 0
      wx.switchTab({
        url: '/pages/player/player'
      })
    }).catch(() => {})
  }
})