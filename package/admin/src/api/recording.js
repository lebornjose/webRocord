import request from './request'

/**
 * 录制记录 API
 */
export default {
  /**
   * 获取录制列表
   */
  getRecordingList(params = {}) {
    return request({
      url: '/recording/list',
      method: 'get',
      params: {
        page: 1,
        limit: 20,
        sortBy: 'metadata.recordedAt',
        order: 'desc',
        ...params
      }
    })
  },

  /**
   * 搜索录制
   */
  searchRecordings(keyword, params = {}) {
    return request({
      url: '/recording/search',
      method: 'get',
      params: {
        q: keyword,
        page: 1,
        limit: 20,
        ...params
      }
    })
  },

  /**
   * 获取录制详情
   */
  getRecording(id, includeEvents = true) {
    return request({
      url: `/recording/${id}`,
      method: 'get',
      params: { includeEvents }
    })
  },

  /**
   * 更新录制
   */
  updateRecording(id, data) {
    return request({
      url: `/recording/${id}`,
      method: 'patch',
      data
    })
  },

  /**
   * 删除录制
   */
  deleteRecording(id, permanent = false) {
    return request({
      url: `/recording/${id}`,
      method: 'delete',
      params: { permanent }
    })
  },

  /**
   * 获取统计信息
   */
  getStatistics() {
    return request({
      url: '/recording/stats/summary',
      method: 'get'
    })
  },

  /**
   * 获取回放 URL
   */
  getPlaybackUrl(id) {
    return `/api/playback/${id}`
  }
}
