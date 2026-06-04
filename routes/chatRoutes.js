const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createOrAppendStudentQuestion,
  getStudentConversation,
  getStudentConversations,
  getAdminQueryList,
  getAdminMessagesForQuery,
  adminReplyToQuery
} = require('../controllers/chatController');

router.post('/questions', protect, createOrAppendStudentQuestion);
router.get('/conversation', protect, getStudentConversation);
router.get('/conversations', protect, getStudentConversations);

router.get('/admin/queries', protect, adminOnly, getAdminQueryList);
router.get('/admin/messages/:queryId', protect, adminOnly, getAdminMessagesForQuery);
router.post('/admin/reply/:queryId', protect, adminOnly, adminReplyToQuery);

module.exports = router;
