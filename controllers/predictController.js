const db = require('../db');

/**
 * @desc Get college predictions with advanced filtering and pagination
 * @route GET /api/predict
 */
const getPredictions = async (req, res) => {
  try {
    const { 
      rank, 
      category, 
      gender, 
      branch_code, 
      chance,
      search, 
      district, 
      is_autonomous,
      page = 1,
      limit = 20
    } = req.query;

    if (!rank || !category || !gender) {
      return res.status(400).json({ message: 'Rank, category, and gender are required' });
    }

    const studentRank = parseInt(rank);

    // Determine suggested maximum number of colleges to return based on rank ranges
    const suggestedLimit = (function(r) {
      if (r <= 1000) return 8;
      if (r <= 3000) return 10;
      if (r <= 7000) return 12;
      if (r <= 15000) return 15;
      if (r <= 30000) return 18;
      if (r <= 50000) return 20;
      if (r <= 80000) return 25;
      if (r <= 120000) return 30;
      return 40;
    })(studentRank);

    // If client provided a limit, respect it but do not exceed suggestedLimit
    const requestedLimit = limit ? Math.max(1, parseInt(limit)) : null;
    const effectiveLimit = requestedLimit ? Math.min(requestedLimit, suggestedLimit) : suggestedLimit;

    const offset = (parseInt(page) - 1) * effectiveLimit;

    const lowerBuffer = Math.max(1000, Math.min(20000, Math.floor(studentRank * 0.15)));
    const upperBuffer = studentRank > 60000 ? 20000 : studentRank > 30000 ? 10000 : studentRank > 10000 ? 5000 : 2000;
    const minRankWindow = Math.max(1, studentRank - lowerBuffer);
    const maxRankWindow = studentRank + upperBuffer;

    // Normalize inputs for DB matching
    const upperGender = gender.toUpperCase();
    const dbGender = (upperGender === 'M' || upperGender === 'MALE' || upperGender === 'BOYS') 
      ? 'BOYS' 
      : ((upperGender === 'F' || upperGender === 'FEMALE' || upperGender === 'GIRLS') ? 'GIRLS' : upperGender);
    
    // Ensure category is Uppercase (e.g., 'oc' -> 'OC')
    const dbCategory = category.toUpperCase().replace(/\s+/g, '_');

    // Normalize branch codes
    let dbBranchCode = branch_code;
    // allow comma-separated multi-branch selectors
    let branchList = null;
    if (branch_code && branch_code !== 'ALL') {
      branchList = branch_code.split(',').map(b => b.trim()).filter(Boolean).map(b => {
        if (b === 'IT') return 'INF';
        if (b === 'MECH') return 'MEC';
        if (b === 'CIVIL') return 'CIV';
        return b;
      });
      if (branchList.length === 0) branchList = null;
    }

    // Handle SC Category subcategories matching (SC_I, SC_II, SC_III)
    const params = [studentRank];
    
    let categoryCondition;
    if (dbCategory === 'SC') {
      categoryCondition = `(category IN ('SC', 'SC_I', 'SC_II', 'SC_III') OR category = 'ALL')`;
    } else {
      params.push(dbCategory);
      categoryCondition = `(category = $${params.length} OR category = 'ALL')`;
    }

    params.push(dbGender);
    const genderPlaceholder = `$${params.length}`;

    // Dynamic Query Building with chance filtering
    let query = `
      SELECT *, 
      CASE 
        WHEN $1 <= closing_rank * 0.7 THEN 'SAFE'
        WHEN $1 <= closing_rank THEN 'MODERATE'
        ELSE 'DREAM'
      END as chance
      FROM cutoff_ranks 
      WHERE ${categoryCondition}
      AND (gender = ${genderPlaceholder} OR gender = 'B' OR gender = 'BOTH')
    `;

    const chanceUpper = chance ? chance.toUpperCase() : 'ALL';
    const effectiveMinRankWindow = chanceUpper === 'ALL' ? 1 : minRankWindow;
    params.push(effectiveMinRankWindow, maxRankWindow);
    query += ` AND closing_rank BETWEEN $${params.length - 1} AND $${params.length}`;

    // Apply chance parameter filters
    if (chanceUpper === 'SAFE') {
      // safe colleges: closing rank is far enough from student rank (easier admit)
      params.push(Math.ceil(studentRank / 0.7));
      query += ` AND closing_rank >= $${params.length}`;
    } else if (chanceUpper === 'MODERATE') {
      // moderate colleges: closing rank is between student rank and safe threshold
      params.push(studentRank);
      query += ` AND closing_rank >= $${params.length}`;
      params.push(Math.ceil(studentRank / 0.7));
      query += ` AND closing_rank < $${params.length}`;
    } else if (chanceUpper === 'DREAM') {
      // dream colleges: closing rank is better than student rank but close enough to be reachable
      params.push(Math.floor(studentRank * 0.85));
      query += ` AND closing_rank >= $${params.length}`;
      params.push(studentRank);
      query += ` AND closing_rank < $${params.length}`;
    }

    // Filter: Branch (support IN lists)
    if (branchList) {
      const placeholders = branchList.map((_, i) => `$${params.length + i + 1}`).join(', ');
      params.push(...branchList);
      query += ` AND branch_code IN (${placeholders})`;
    }

    // Filter: College Search
    if (search) {
      params.push(`%${search}%`);
      query += ` AND institute_name ILIKE $${params.length}`;
    }

    // Filter: District
    if (district) {
      params.push(district);
      query += ` AND district_code = $${params.length}`;
    }

    // Filter: Autonomous
    if (is_autonomous !== undefined && is_autonomous !== '') {
      params.push(is_autonomous === 'true');
      query += ` AND is_autonomous = $${params.length}`;
    }

    // Total Count for Pagination
    const countQuery = `SELECT COUNT(*) FROM (${query}) as total`;
    const totalCountRes = await db.query(countQuery, params);
    const totalRecords = parseInt(totalCountRes.rows[0].count);
    // Cap the reported total to the suggestedLimit so UI shows only the target number of colleges
    const reportedTotal = Math.min(totalRecords, suggestedLimit);

    // Final Sorting and Pagination
    params.push(effectiveLimit, offset);
    query += ` ORDER BY ABS(closing_rank - $1) ASC, closing_rank ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await db.query(query, params);

    res.status(200).json({
      status: 'success',
      pagination: {
        total: reportedTotal,
        page: parseInt(page),
        limit: effectiveLimit,
        totalPages: Math.ceil(reportedTotal / effectiveLimit) || 1
      },
      data: result.rows
    });
  } catch (error) {
    console.error('Prediction Engine Error:', error);
    res.status(500).json({ message: 'Internal server error in prediction engine' });
  }
};

const getDistricts = async (req, res) => {
  try {
    const result = await db.query('SELECT DISTINCT district_code FROM cutoff_ranks WHERE district_code IS NOT NULL ORDER BY district_code');
    const districts = result.rows.map(row => row.district_code).filter(Boolean);
    res.status(200).json({ status: 'success', data: districts });
  } catch (error) {
    console.error('Districts Fetch Error:', error);
    res.status(500).json({ message: 'Failed to load district list' });
  }
};

module.exports = {
  getPredictions,
  getDistricts
};
