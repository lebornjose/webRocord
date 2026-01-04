const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Recording = require('../models/Recording');

// 保存录制数据
router.post('/save', async (req, res) => {
  try {
    const { events, metadata = {} } = req.body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({
        error: 'Invalid request: events array is required'
      });
    }

    if (events.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: events array cannot be empty'
      });
    }

    // 生成唯一 ID
    const recordingId = uuidv4();

    // 创建录制记录
    const recording = new Recording({
      recordingId,
      events,
      metadata: {
        ...metadata,
        recordedAt: metadata.recordedAt || new Date()
      }
    });

    await recording.save();

    res.json({
      success: true,
      recordingId,
      message: 'Recording saved successfully',
      metadata: {
        title: recording.metadata.title,
        recordedAt: recording.metadata.recordedAt,
        eventCount: recording.metadata.eventCount,
        duration: recording.metadata.duration
      }
    });

  } catch (error) {
    console.error('Error saving recording:', error);
    res.status(500).json({
      error: 'Failed to save recording',
      message: error.message
    });
  }
});

// 获取录制列表
router.get('/list', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'metadata.recordedAt',
      order = 'desc',
      status = 'active',
      tag
    } = req.query;

    const query = { status };
    
    // 标签筛选
    if (tag) {
      query['metadata.tags'] = tag;
    }

    // 查询总数
    const total = await Recording.countDocuments(query);

    // 查询数据（不返回 events 以提高性能）
    const recordings = await Recording
      .find(query)
      .select('-events')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: recordings.map(r => ({
        id: r.recordingId,
        title: r.metadata.title,
        recordedAt: r.metadata.recordedAt,
        eventCount: r.metadata.eventCount,
        duration: r.metadata.duration,
        tags: r.metadata.tags,
        viewCount: r.stats.viewCount,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error listing recordings:', error);
    res.status(500).json({
      error: 'Failed to list recordings',
      message: error.message
    });
  }
});

// 搜索录制
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const recordings = await Recording.search(q, { page, limit });
    const total = await Recording.countDocuments({
      $text: { $search: q },
      status: 'active'
    });

    res.json({
      success: true,
      data: recordings.map(r => ({
        id: r.recordingId,
        title: r.metadata.title,
        recordedAt: r.metadata.recordedAt,
        eventCount: r.metadata.eventCount,
        duration: r.metadata.duration
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error searching recordings:', error);
    res.status(500).json({
      error: 'Failed to search recordings',
      message: error.message
    });
  }
});

// 获取指定录制
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { includeEvents = 'true' } = req.query;

    let query = Recording.findOne({ recordingId: id, status: 'active' });
    
    // 如果不需要 events，排除以提高性能
    if (includeEvents === 'false') {
      query = query.select('-events');
    }

    const recording = await query;

    if (!recording) {
      return res.status(404).json({
        error: 'Recording not found'
      });
    }

    // 增加查看次数
    if (includeEvents === 'true') {
      await recording.incrementViewCount();
    }

    res.json({
      success: true,
      data: {
        id: recording.recordingId,
        events: includeEvents === 'true' ? recording.events : undefined,
        metadata: recording.metadata,
        stats: recording.stats,
        createdAt: recording.createdAt,
        updatedAt: recording.updatedAt
      }
    });

  } catch (error) {
    console.error('Error getting recording:', error);
    res.status(500).json({
      error: 'Failed to get recording',
      message: error.message
    });
  }
});

// 更新录制元数据
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { metadata } = req.body;

    const recording = await Recording.findOne({ recordingId: id, status: 'active' });

    if (!recording) {
      return res.status(404).json({
        error: 'Recording not found'
      });
    }

    // 更新允许的元数据字段
    if (metadata) {
      const allowedFields = ['title', 'description', 'tags'];
      allowedFields.forEach(field => {
        if (metadata[field] !== undefined) {
          recording.metadata[field] = metadata[field];
        }
      });
    }

    await recording.save();

    res.json({
      success: true,
      message: 'Recording updated successfully',
      data: {
        id: recording.recordingId,
        metadata: recording.metadata
      }
    });

  } catch (error) {
    console.error('Error updating recording:', error);
    res.status(500).json({
      error: 'Failed to update recording',
      message: error.message
    });
  }
});

// 删除录制（软删除）
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = 'false' } = req.query;

    const recording = await Recording.findOne({ recordingId: id });

    if (!recording) {
      return res.status(404).json({
        error: 'Recording not found'
      });
    }

    if (permanent === 'true') {
      // 永久删除
      await Recording.deleteOne({ recordingId: id });
    } else {
      // 软删除
      recording.status = 'deleted';
      await recording.save();
    }

    res.json({
      success: true,
      message: permanent === 'true' 
        ? 'Recording permanently deleted' 
        : 'Recording moved to trash'
    });

  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({
      error: 'Failed to delete recording',
      message: error.message
    });
  }
});

// 获取统计信息
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Recording.countDocuments({ status: 'active' });
    const totalViews = await Recording.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$stats.viewCount' } } }
    ]);

    const recentRecordings = await Recording.findRecent(5);

    res.json({
      success: true,
      data: {
        totalRecordings: total,
        totalViews: totalViews[0]?.total || 0,
        recentRecordings: recentRecordings.map(r => ({
          id: r.recordingId,
          title: r.metadata.title,
          recordedAt: r.metadata.recordedAt,
          viewCount: r.stats.viewCount
        }))
      }
    });

  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
      message: error.message
    });
  }
});

module.exports = router;
