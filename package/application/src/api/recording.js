// API 请求工具类
// 与后端 server (MongoDB) 交互

const API_BASE = '/api';

class RecordingAPI {
  /**
   * 保存录制数据到服务器
   * @param {Array} events - rrweb 事件数组
   * @param {Object} metadata - 元数据
   */
  static async saveRecording(events, metadata = {}) {
    try {
      const response = await fetch(`${API_BASE}/recording/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events,
          metadata: {
            title: metadata.title || '用户操作录制',
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...metadata
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('保存录制失败:', error);
      throw error;
    }
  }

  /**
   * 获取录制列表
   * @param {Object} options - 查询选项
   */
  static async getRecordingList(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'metadata.recordedAt',
      order = 'desc',
      tag
    } = options;

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order
      });

      if (tag) {
        params.append('tag', tag);
      }

      const response = await fetch(`${API_BASE}/recording/list?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取录制列表失败:', error);
      throw error;
    }
  }

  /**
   * 搜索录制
   * @param {String} keyword - 搜索关键词
   * @param {Object} options - 分页选项
   */
  static async searchRecordings(keyword, options = {}) {
    const { page = 1, limit = 10 } = options;

    try {
      const params = new URLSearchParams({
        q: keyword,
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${API_BASE}/recording/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('搜索录制失败:', error);
      throw error;
    }
  }

  /**
   * 获取指定录制
   * @param {String} recordingId - 录制 ID
   * @param {Boolean} includeEvents - 是否包含事件数据
   */
  static async getRecording(recordingId, includeEvents = true) {
    try {
      const params = new URLSearchParams({
        includeEvents: includeEvents.toString()
      });

      const response = await fetch(`${API_BASE}/recording/${recordingId}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取录制失败:', error);
      throw error;
    }
  }

  /**
   * 更新录制元数据
   * @param {String} recordingId - 录制 ID
   * @param {Object} metadata - 要更新的元数据
   */
  static async updateRecording(recordingId, metadata) {
    try {
      const response = await fetch(`${API_BASE}/recording/${recordingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ metadata })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('更新录制失败:', error);
      throw error;
    }
  }

  /**
   * 删除录制
   * @param {String} recordingId - 录制 ID
   * @param {Boolean} permanent - 是否永久删除
   */
  static async deleteRecording(recordingId, permanent = false) {
    try {
      const params = new URLSearchParams({
        permanent: permanent.toString()
      });

      const response = await fetch(`${API_BASE}/recording/${recordingId}?${params}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('删除录制失败:', error);
      throw error;
    }
  }

  /**
   * 获取统计信息
   */
  static async getStatistics() {
    try {
      const response = await fetch(`${API_BASE}/recording/stats/summary`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('获取统计信息失败:', error);
      throw error;
    }
  }

  /**
   * 打开回放页面
   * @param {String} recordingId - 录制 ID
   */
  static openPlayback(recordingId) {
    const url = `${API_BASE}/playback/${recordingId}`;
    window.open(url, '_blank');
  }

  /**
   * 获取回放 URL
   * @param {String} recordingId - 录制 ID
   */
  static getPlaybackUrl(recordingId) {
    return `${API_BASE}/playback/${recordingId}`;
  }
}

export default RecordingAPI;

