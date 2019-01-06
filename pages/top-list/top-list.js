const app = getApp().globalData
const api = require('../../utils/api.js')
const song = require('../../utils/song.js')
Page({
  onLoad: function () {
    this._getTopMusicList()
  },
  _getTopMusicList: function () {

    api.request.get(`/songIdlist/${app.topId}`).then((res) => {
      this.setData({
        topList: this._normalizeSongs(res.data.data.songlist, res.data.data.topinfo.pic_album),
        title: res.data.data.topinfo.ListName
      })
    })
  },
  _normalizeSongs:function(list, imgUrl) {
    let ret = []
    list.forEach((item) => {
      if (item.songmid) {
        ret.push(song.createSong(Object.assign(item, { imgUrl })))
      } 
    })
    return ret
  }
})