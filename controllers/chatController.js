const db = require('../db');

const createOrAppendStudentQuestion = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { college_id, college_name, branch_code, branch_name, question } = req.body;

    console.log('📨 Creating student question:', { studentId, college_id, college_name, question: question?.substring(0, 50) });

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    if (!studentId) {
      return res.status(401).json({ message: 'Student ID not found in token' });
    }

    const client = await db.pool.connect();
    console.log('✅ Database connection established');
    
    try {
      await client.query('BEGIN');
      console.log('✅ Transaction started');

      const existingQuery = await client.query(
        `SELECT id FROM student_queries
         WHERE student_id = $1 AND ${college_id ? 'college_id = $2' : 'college_id IS NULL'}
         ORDER BY updated_at DESC
         LIMIT 1`,
        college_id ? [studentId, college_id] : [studentId]
      );

      console.log('✅ Query check complete. Existing records:', existingQuery.rows.length);

      let queryId;
      const normalizedCollegeName = college_name?.trim() || 'General question';
      if (existingQuery.rows.length > 0) {
        queryId = existingQuery.rows[0].id;
        console.log('📝 Updating existing query:', queryId);
        await client.query(
          `UPDATE student_queries
           SET question = $1, status = 'PENDING', college_name = $2, branch_code = $3, branch_name = $4, updated_at = NOW()
           WHERE id = $5`,
          [question, normalizedCollegeName, branch_code, branch_name, queryId]
        );
      } else {
        console.log('📝 Creating new query');
        const insertQuery = await client.query(
          `INSERT INTO student_queries (student_id, college_id, college_name, branch_code, branch_name, question, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
           RETURNING *`,
          [studentId, college_id || null, normalizedCollegeName, branch_code, branch_name, question]
        );
        queryId = insertQuery.rows[0].id;
        console.log('✅ New query created:', queryId);
      }

      await client.query(
        `INSERT INTO chat_messages (query_id, sender, message)
         VALUES ($1, 'student', $2)`,
        [queryId, question]
      );
      console.log('✅ Chat message inserted');

      await client.query('COMMIT');
      console.log('✅ Transaction committed');

      const messages = await db.query(
        'SELECT sender, message, created_at FROM chat_messages WHERE query_id = $1 ORDER BY created_at ASC',
        [queryId]
      );
      const queryDetails = await db.query('SELECT * FROM student_queries WHERE id = $1', [queryId]);

      res.status(201).json({
        status: 'success',
        query: queryDetails.rows[0],
        messages: messages.rows
      });
    } catch (error) {
      console.error('❌ Transaction error:', error.message);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
      console.log('✅ Database connection released');
    }
  } catch (error) {
    console.error('❌ Student Query Error:', error.message, '\nStack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to submit student question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getStudentConversation = async (req, res) => {
  try {
    const studentId = req.user.id;
    const collegeId = req.query.collegeId;

    const queryRes = await db.query(
      `SELECT * FROM student_queries
       WHERE student_id = $1 AND ${collegeId ? 'college_id = $2' : 'college_id IS NULL'}
       ORDER BY updated_at DESC
       LIMIT 1`,
      collegeId ? [studentId, collegeId] : [studentId]
    );

    if (queryRes.rows.length === 0) {
      return res.status(200).json({ status: 'success', conversation: null, messages: [] });
    }

    const conversation = queryRes.rows[0];
    const messages = await db.query(
      'SELECT sender, message, created_at FROM chat_messages WHERE query_id = $1 ORDER BY created_at ASC',
      [conversation.id]
    );

    res.status(200).json({ status: 'success', conversation, messages: messages.rows });
  } catch (error) {
    console.error('Fetch Conversation Error:', error);
    res.status(500).json({ message: 'Failed to load conversation' });
  }
};

const getStudentConversations = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      `SELECT q.id, q.college_id, q.college_name, q.branch_name, q.status, q.created_at, q.updated_at,
              cm.message AS latest_message, cm.created_at AS latest_at
       FROM student_queries q
       LEFT JOIN LATERAL (
         SELECT message, created_at FROM chat_messages WHERE query_id = q.id ORDER BY created_at DESC LIMIT 1
       ) cm ON true
       WHERE q.student_id = $1
       ORDER BY q.updated_at DESC`,
      [studentId]
    );

    res.status(200).json({ status: 'success', conversations: result.rows });
  } catch (error) {
    console.error('Fetch Student Conversations Error:', error);
    res.status(500).json({ message: 'Failed to load conversations' });
  }
};

const getAdminQueryList = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT q.id, q.student_id, q.college_id, q.college_name, q.branch_name, q.status, q.created_at, q.updated_at,
              s.name AS student_name, s.mobile_number,
              cm.message AS latest_message, cm.created_at AS latest_at
       FROM student_queries q
       JOIN students s ON s.id = q.student_id
       LEFT JOIN LATERAL (
         SELECT message, created_at FROM chat_messages WHERE query_id = q.id ORDER BY created_at DESC LIMIT 1
       ) cm ON true
       ORDER BY q.updated_at DESC`,
      []
    );

    res.status(200).json({ status: 'success', queries: result.rows });
  } catch (error) {
    console.error('Fetch Admin Query List Error:', error);
    res.status(500).json({ message: 'Failed to load student question list' });
  }
};

const getAdminMessagesForQuery = async (req, res) => {
  try {
    const { queryId } = req.params;

    const queryRes = await db.query(
      `SELECT q.id, q.student_id, q.college_id, q.college_name, q.branch_name, q.status, q.created_at, q.updated_at,
              s.name AS student_name, s.mobile_number
       FROM student_queries q
       JOIN students s ON s.id = q.student_id
       WHERE q.id = $1`,
      [queryId]
    );

    if (queryRes.rows.length === 0) {
      return res.status(404).json({ message: 'Question thread not found' });
    }

    const messages = await db.query(
      'SELECT sender, message, created_at FROM chat_messages WHERE query_id = $1 ORDER BY created_at ASC',
      [queryId]
    );

    res.status(200).json({ status: 'success', query: queryRes.rows[0], messages: messages.rows });
  } catch (error) {
    console.error('Fetch Admin Messages Error:', error);
    res.status(500).json({ message: 'Failed to load messages for query' });
  }
};

const adminReplyToQuery = async (req, res) => {
  try {
    const { queryId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const queryRes = await client.query('SELECT id FROM student_queries WHERE id = $1', [queryId]);
      if (queryRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Question thread not found' });
      }

      await client.query(
        `INSERT INTO chat_messages (query_id, sender, message)
         VALUES ($1, 'admin', $2)`,
        [queryId, message]
      );

      await client.query(
        `UPDATE student_queries
         SET status = 'ANSWERED', updated_at = NOW()
         WHERE id = $1`,
        [queryId]
      );

      await client.query('COMMIT');

      const messages = await db.query('SELECT sender, message, created_at FROM chat_messages WHERE query_id = $1 ORDER BY created_at ASC', [queryId]);
      const queryDetails = await db.query('SELECT * FROM student_queries WHERE id = $1', [queryId]);

      res.status(200).json({ status: 'success', query: queryDetails.rows[0], messages: messages.rows });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Admin Reply Error:', error);
    res.status(500).json({ message: 'Failed to send reply' });
  }
};

module.exports = {
  createOrAppendStudentQuestion,
  getStudentConversation,
  getStudentConversations,
  getAdminQueryList,
  getAdminMessagesForQuery,
  adminReplyToQuery
};
