const app = getApp()
Component({
  properties: {
    songs: {
      type: Array,
      value: []
    }
  },
  methods: {
    selectItem: function (e) {
      app.globalData.currentIndex = e.currentTarget.dataset.index
      app.globalData.songlist = this.properties.songs
      app.globalData.ooo = 222
      app.globalTime.time = 1

      wx.setStorageSync('songlist', this.properties.songs)
      wx.switchTab({
        url: '/pages/player/player'
      })
    }
  }
})