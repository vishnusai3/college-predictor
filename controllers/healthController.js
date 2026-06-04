const db = require('../db');

/**
 * @desc Get server health status
 * @route GET /api/health
 */
const getHealth = async (req, res) => {
  try {
    // Check DB connection
    const dbCheck = await db.query('SELECT NOW()');
    
    res.status(200).json({
      status: 'success',
      message: 'Server is healthy and connected to database',
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: dbCheck.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server is running but database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  getHealth
};
