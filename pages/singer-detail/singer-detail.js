const app = getApp()
const song = require('../../utils/song.js')
const api = require('../../utils/api.js')
Page({
  data: {
    songs: []
  },
  onLoad: function () {
    this.setData({
      title: app.globalData.selectsinger.name,
      image: app.globalData.selectsinger.avatar
    })

    app.globalData.fromSinger = false

  },
  _normallizeSongs: function (list) {
    let ret = []
    list.forEach((item) => {
      let {musicData} = item
      if (musicData.songid && musicData.albummid) {
        ret.push(song.createSong(musicData))
      }
    })
    return ret
  },
  /*上拉加载更多歌曲*/
  childEvent: function (e) {
  }
})