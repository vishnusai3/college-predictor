const fs = require('fs');
const csv = require('csv-parser');
const db = require('../db');

const importCutoffs = async (filePath) => {
  const records = [];
  console.log(`🚀 Starting precision import from: ${filePath}`);

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const instName = row['institute_name'] || '';
        const baseInfo = {
          institute_code: row['institute code'],
          institute_name: instName,
          place: row['place'],
          district_code: row['district_code'],
          branch_code: row['branch_code'],
          branch_name: row['branch_name'],
          year: 2025,
          is_autonomous: instName.toUpperCase().includes('AUTONOMOUS')
        };

        if (!baseInfo.institute_code || !baseInfo.branch_code) return;

        Object.keys(row).forEach(key => {
          if (key.endsWith('_BOYS') || key.endsWith('_GIRLS')) {
            let rawVal = String(row[key] || '');
            if (rawVal && rawVal !== 'NA' && rawVal !== 'null') {
              // Only take the first chunk of digits (prevents the e+55 error)
              const match = rawVal.match(/\d+/);
              if (match) {
                const rank = parseInt(match[0]);
                // Ensure rank is within realistic range (1 to 1,000,000)
                if (rank > 0 && rank < 1000000) {
                  const parts = key.split('_');
                  const gender = parts.pop();
                  const category = parts.join('_');

                  records.push({ ...baseInfo, category, gender, closing_rank: rank });
                }
              }
            }
          }
        });
      })
      .on('end', async () => {
        console.log(`Verified ${records.length} records.`);
        try {
          console.log('Truncating cutoff_ranks table...');
          await db.query('TRUNCATE TABLE cutoff_ranks;');
          console.log('Table truncated successfully.');
          await batchInsert(records);
          console.log(`✅ SUCCESS! ${records.length} records are now live!`);
          resolve();
        } catch (e) { console.error(e.message); reject(e); }
      });
  });
};

const batchInsert = async (records) => {
  const batchSize = 200;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const placeholders = batch.map((_, idx) => {
      const o = idx * 11;
      return `($${o+1}, $${o+2}, $${o+3}, $${o+4}, $${o+5}, $${o+6}, $${o+7}, $${o+8}, $${o+9}, $${o+10}, $${o+11})`;
    }).join(',');
    
    const values = batch.flatMap(r => [
      r.institute_code, r.institute_name, r.place, r.district_code,
      r.branch_code, r.branch_name, r.category, r.gender, r.closing_rank, r.year, r.is_autonomous
    ]);

    await db.query(`INSERT INTO cutoff_ranks (institute_code, institute_name, place, district_code, branch_code, branch_name, category, gender, closing_rank, year, is_autonomous) VALUES ${placeholders}`, values);
    process.stdout.write(`Importing: ${Math.min(i + batchSize, records.length)}/${records.length}\r`);
  }
};

importCutoffs('tgeapcet_2025_fixed.csv').then(() => process.exit(0)).catch(() => process.exit(1));
