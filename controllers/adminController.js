const db = require('../db');
const fs = require('fs');
const csv = require('csv-parser');

/**
 * @desc Handle CSV upload for cutoffs
 * @route POST /api/admin/upload-cutoffs
 */
const uploadCutoffs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const records = [];
    const cutoffColumns = [
      'OC_BOYS', 'OC_GIRLS', 'BC_A_BOYS', 'BC_A_GIRLS',
      'BC_B_BOYS', 'BC_B_GIRLS', 'BC_C_BOYS', 'BC_C_GIRLS',
      'BC_D_BOYS', 'BC_D_GIRLS', 'BC_E_BOYS', 'BC_E_GIRLS',
      'SC_I_BOYS', 'SC_I_GIRLS', 'SC_II_BOYS', 'SC_II_GIRLS',
      'SC_III_BOYS', 'SC_III_GIRLS', 'ST_BOYS', 'ST_GIRLS',
      'EWS_BOYS', 'EWS_GIRLS'
    ];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const baseInfo = {
          institute_code: row['institute code'],
          institute_name: row['institute name'],
          place: row['place'],
          district_code: row['district code'],
          branch_code: row['branch code'],
          branch_name: row['branch name'],
          year: 2024
        };

        for (const col of cutoffColumns) {
          const rankValue = row[col];
          if (rankValue && rankValue !== 'null' && rankValue !== 'NA') {
            const rank = parseInt(rankValue.replace(/,/g, ''));
            if (!isNaN(rank)) {
              const parts = col.split('_');
              const gender = parts.pop();
              const category = parts.join('_');
              records.push({ ...baseInfo, category, gender, closing_rank: rank });
            }
          }
        }
      })
      .on('end', async () => {
        // Efficient chunked insertion
        const BATCH_SIZE = 100;
        for (let i = 0; i < records.length; i += BATCH_SIZE) {
          const batch = records.slice(i, i + BATCH_SIZE);
          const valuePlaceholders = batch.map((_, idx) => {
            const offset = idx * 10;
            return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})`;
          }).join(', ');

          const values = batch.flatMap(rec => [
            rec.institute_code, rec.institute_name, rec.place, rec.district_code,
            rec.branch_code, rec.branch_name, rec.category, rec.gender,
            rec.closing_rank, rec.year
          ]);

          await db.query(`INSERT INTO cutoff_ranks (institute_code, institute_name, place, district_code, branch_code, branch_name, category, gender, closing_rank, year) VALUES ${valuePlaceholders}`, values);
        }

        // Clean up
        fs.unlinkSync(filePath);
        res.status(201).json({ message: `Successfully imported ${records.length} cutoff records!` });
      });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Failed to process CSV file' });
  }
};

/**
 * @desc Get all students for admin dashboard
 * @route GET /api/admin/students
 */
const getAllStudents = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT * FROM students';
    let params = [];

    if (search) {
      query += ' WHERE name ILIKE $1 OR mobile_number ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY login_timestamp DESC';

    const result = await db.query(query, params);

    res.status(200).json({
      status: 'success',
      count: result.rows.length,
      students: result.rows
    });
  } catch (error) {
    console.error('Admin Fetch Students Error:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

/**
 * @desc Get platform analytics
 * @route GET /api/admin/analytics
 */
const getAnalytics = async (req, res) => {
  try {
    // 1. Category Distribution
    const categoryQuery = 'SELECT category, COUNT(*) as count FROM students GROUP BY category';
    const categoryRes = await db.query(categoryQuery);

    // 2. Registrations by Date (Last 7 days)
    const dailyQuery = `
      SELECT DATE(login_timestamp) as date, COUNT(*) as count 
      FROM students 
      WHERE login_timestamp > CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(login_timestamp)
      ORDER BY date
    `;
    const dailyRes = await db.query(dailyQuery);

    // 3. Gender Split
    const genderQuery = 'SELECT gender, COUNT(*) as count FROM students GROUP BY gender';
    const genderRes = await db.query(genderQuery);

    // 4. Basic Summary
    const summaryQuery = 'SELECT COUNT(*) as total_students FROM students';
    const summaryRes = await db.query(summaryQuery);
    
    const cutoffCountQuery = 'SELECT COUNT(*) as total_cutoffs FROM cutoff_ranks';
    const cutoffCountRes = await db.query(cutoffCountQuery);

    res.status(200).json({
      status: 'success',
      data: {
        categoryDistribution: categoryRes.rows,
        dailyRegistrations: dailyRes.rows,
        genderDistribution: genderRes.rows,
        summary: {
          totalStudents: parseInt(summaryRes.rows[0].total_students || 0),
          totalCutoffs: parseInt(cutoffCountRes.rows[0].total_cutoffs || 0)
        }
      }
    });
  } catch (error) {
    console.error('Analytics Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

module.exports = {
  getAllStudents,
  uploadCutoffs,
  getAnalytics
};

/**
 * @desc Delete a student by id
 * @route DELETE /api/admin/students/:id
 */
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Student id required' });
    await db.query('DELETE FROM students WHERE id = $1', [id]);
    res.status(200).json({ status: 'success', message: 'Student deleted' });
  } catch (error) {
    console.error('Delete Student Error:', error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
};

/**
 * @desc Add a single college with multiple cutoff entries
 * @route POST /api/admin/colleges
 * Expected body: { institute_code, institute_name, place, district_code, year, is_autonomous, cutoffs: [ { branch_code, branch_name, category, gender, closing_rank } ] }
 */
const addSingleCollege = async (req, res) => {
  try {
    const { institute_code, institute_name, place, district_code, year = new Date().getFullYear(), is_autonomous = false, cutoffs } = req.body;
    if (!institute_code || !institute_name || !Array.isArray(cutoffs) || cutoffs.length === 0) {
      return res.status(400).json({ message: 'Missing required college fields or cutoffs' });
    }

    // Prepare bulk insert
    const values = [];
    const placeholders = cutoffs.map((c, idx) => {
      const offset = idx * 10;
      values.push(
        institute_code,
        institute_name,
        place || null,
        district_code || null,
        c.branch_code,
        c.branch_name,
        c.category,
        c.gender,
        c.closing_rank,
        year
      );
      return `($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5}, $${offset+6}, $${offset+7}, $${offset+8}, $${offset+9}, $${offset+10})`;
    }).join(', ');

    const insertQuery = `INSERT INTO cutoff_ranks (institute_code, institute_name, place, district_code, branch_code, branch_name, category, gender, closing_rank, year) VALUES ${placeholders}`;
    await db.query(insertQuery, values);

    res.status(201).json({ status: 'success', message: 'College and cutoffs added' });
  } catch (error) {
    console.error('Add Single College Error:', error);
    res.status(500).json({ message: 'Failed to add college' });
  }
};

// Extend exports
module.exports.deleteStudent = deleteStudent;
module.exports.addSingleCollege = addSingleCollege;
