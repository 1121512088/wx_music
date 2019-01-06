const app = getApp().globalData
let globalTime = getApp().globalTime
const song = require('../../utils/song.js')
const Lyric = require('../../utils/lyric.js')
const util = require('../../utils/util.js')
const api = require('../../utils/api.js')

const SEQUENCE_MODE = 1
const RANDOM_MOD = 2
const SINGLE_CYCLE_MOD = 3

Page({
  data: {
    playurl: '',
    playIcon: 'icon-play',
    cdCls: 'pause',
    currentLyric: null,
    currentLineNum: 0,
    toLineNum: -1,
    currentSong: null,
    dotsArray: new Array(2),
    currentDot: 0,
    playMod: SEQUENCE_MODE
  },

  onShow: function () {
    this._init()
  },

  //初始化
  _init: function () {
    if (this.data.currentTime !== undefined) {

      if (globalTime.time > 0 ) {
        this._copy();
        globalTime.time = 0;
      }

      if (Number(this.data.currentTime.split(':')[0]) < 4) return;
      this._copy();

    } else {
      this._copy();
    }
  },

  _copy: function () {
    let songslist = (app.songlist.length && app.songlist) || wx.getStorageSync('songlist')
    let currentSong = app.songlist[app.currentIndex] || (songslist && songslist[app.currentIndex])
    let duration = currentSong && currentSong.duration

    this.setData({
      currentSong: currentSong,
      duration: this._formatTime(duration),
      songslist: songslist,
      currentIndex: app.currentIndex
    })

    this._getPlayUrl(currentSong.mid)
    this._getLyric(currentSong)
  },

  // 获取背景播放音乐的songmidid
  _getBackPlayfileName: function () {
    return new Promise((resolve, reject) => {
      wx.getBackgroundAudioPlayerState({
        success: function (res) {
          var dataUrl = res.dataUrl
          let ret = dataUrl && dataUrl.split('?')[0].split('/')[3]
          resolve({ret, res})
        },
        fail: function (e) {
          let ret = false
          reject(ret)
        }
      })
    })
  },

  // 获取播放地址
  _getPlayUrl: function (songmidid) {
    api.request.get(`/songUrllist/${songmidid}`).then((res) => {
      const playUrl = res.data.data[0];

      if (playUrl === 'http://isure.stream.qqmusic.qq.com//') {
        api.openAlert('暂无权限! sorry');
        return;
      }

      this._getBackPlayfileName().then((nowPlay) => {
        if (!(res2.data.items[0].filename === nowPlay.ret)) {
          this._createAudio(playUrl)
        }
      }).catch((err) => {
        this._createAudio(playUrl)
      })
    })
  },

  // 创建播放器
  _createAudio: function (playUrl) {
    wx.playBackgroundAudio({
      dataUrl: playUrl,
      title: this.data.currentSong.name,
      coverImgUrl: this.data.currentSong.image
    })
    // 监听音乐播放。
    wx.onBackgroundAudioPlay(() => {
      this.setData({
        playIcon: 'icon-pause',
        cdCls: 'play'
      })
    })
    // 监听音乐暂停。
    wx.onBackgroundAudioPause(() => {
      this.setData({
        playIcon: 'icon-play',
        cdCls: 'pause'
      })
    })
    // 监听音乐停止。
    wx.onBackgroundAudioStop(() => {
      if (this.data.playMod === SINGLE_CYCLE_MOD) {
        this._init()
        return
      }
      this.next()
    })
    // 监听播放拿取播放进度
    const manage = wx.getBackgroundAudioManager()
    manage.onTimeUpdate(() => {
      const currentTime = manage.currentTime
      this.setData({
        currentTime: this._formatTime(currentTime),
        percent: currentTime / this.data.currentSong.duration
      })
      if (this.data.currentLyric) {
        this.handleLyric(currentTime * 1000)
      }
    })
  },
  // 获取歌词
  _getLyric: function (currentSong) {
    const _this = this
    this._getBackPlayfileName().then((res) => {
      const nowMid = res.ret.split('.')[0].replace('C400', '')
      if (!(nowMid === currentSong.mid)) {
        if (this.data.currentLyric) {
          //this.data.currentLyric.stop && this.data.currentLyric.stop()
        }
        _this._getLyricAction(currentSong)
      }
    }).catch(() => {
      _this._getLyricAction(currentSong)
    })
  },

  // 获取处理歌词
  _getLyricAction: function (currentSong) {
    song.getLyric(currentSong.mid).then((res) => {
      if (res.data.showapi_res_body.ret_code == 0) {
        const lyric = this._normalizeLyric(res.data.showapi_res_body.lyric)
        const currentLyric = new Lyric(lyric)
        this.setData({
          currentLyric: currentLyric
        })
      } else {
        this.setData({
          currentLyric: null,
          currentText: ''
        })
      }
    })
  },
  // 去掉歌词中的转义字符
  _normalizeLyric: function (lyric) {
    return lyric.replace(/&#58;/g, ':').replace(/&#10;/g, '\n').replace(/&#46;/g, '.').replace(/&#32;/g, ' ').replace(/&#45;/g, '-').replace(/&#40;/g, '(').replace(/&#41;/g, ')')
  },
  // 歌词滚动回调函数
  handleLyric: function (currentTime) {
    let lines = [{time: 0, txt: ''}], lyric = this.data.currentLyric, lineNum
    lines = lines.concat(lyric.lines)
    for (let i = 0; i < lines.length; i++) {
      if (i < lines.length - 1) {
        let time1 = lines[i].time, time2 = lines[i + 1].time
        if (currentTime > time1 && currentTime < time2) {
          lineNum = i - 1
          break;
        }
      } else {
        lineNum = lines.length - 2
      }
    }
    this.setData({
      currentLineNum: lineNum,
      currentText: lines[lineNum + 1] && lines[lineNum + 1].txt
    })

    let toLineNum = lineNum - 5
    if (lineNum > 5 && toLineNum != this.data.toLineNum) {
      this.setData({
        toLineNum: toLineNum
      })
    }
  },
  _formatTime: function (interval) {
    interval = interval | 0
    const minute = interval / 60 | 0
    const second = this._pad(interval % 60)
    return `${minute}:${second}`
  },
  /*秒前边加0*/
  _pad(num, n = 2) {
    let len = num.toString().length
    while (len < n) {
      num = '0' + num
      len++
    }
    return num
  },
  changeMod: function () {
    let playMod = this.data.playMod + 1
    if (playMod > SINGLE_CYCLE_MOD) {
      playMod = SEQUENCE_MODE
    }
    this.setData({
      playMod: playMod
    })
  },
  prev: function () {
    app.currentIndex = this.getNextIndex(false)
    this.setData({
      currentTime: '5'
    })
    this._init()
  },
  next: function () {
    app.currentIndex = this.getNextIndex(true)
    this.setData({
      currentTime: '5'
    })
    this._init()
  },
  /**
   * 获取不同播放模式下的下一曲索引
   * @param nextFlag: next or prev
   * @returns currentIndex
   */
  getNextIndex: function (nextFlag) {
    let ret,
      currentIndex = app.currentIndex,
      mod = this.data.playMod,
      len = this.data.songslist.length
    if (mod === RANDOM_MOD) {
      ret = util.randomNum(len)
    } else {
      if (nextFlag) {
        ret = currentIndex + 1 == len ? 0 : currentIndex + 1
      } else {
        ret = currentIndex - 1 < 0 ? len - 1 : currentIndex - 1
      }
    }
    return ret
  },
  togglePlaying: function () {
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        var status = res.status
        if (status == 1) {
          wx.pauseBackgroundAudio()
        } else {
          wx.playBackgroundAudio()
        }
      }
    })
  },
  openList: function () {
    if (!this.data.songslist.length) {
      return
    }
    this.setData({
      translateCls: 'uptranslate'
    })
  },
  close: function () {
    this.setData({
      translateCls: 'downtranslate'
    })
  },
  playthis: function (e) {
    const index = e.currentTarget.dataset.index
    app.currentIndex = index
    this.setData({
      currentTime: '5'
    })
    this._init()
    this.close()
  },
  changeDot: function (e) {
    this.setData({
      currentDot: e.detail.current
    })
  }
})