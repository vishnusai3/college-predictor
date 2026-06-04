const db = require('./index');

const seedData = [
  // Institute 1: JNTU Hyderabad (Very Competitive) - Hypothesized
  ['JNTUH', 'JNTU COLLEGE OF ENGINEERING HYDERABAD', 'Kukatpally', 'HYD', 'CSE', 'COMPUTER SCIENCE AND ENGINEERING', 'OC', 'M', 500, 2023],
  ['JNTUH', 'JNTU COLLEGE OF ENGINEERING HYDERABAD', 'Kukatpally', 'HYD', 'CSE', 'COMPUTER SCIENCE AND ENGINEERING', 'OC', 'F', 650, 2023],
  ['JNTUH', 'JNTU COLLEGE OF ENGINEERING HYDERABAD', 'Kukatpally', 'HYD', 'ECE', 'ELECTRONICS AND COMMUNICATION ENGINEERING', 'OC', 'M', 1200, 2023],
  
  // Institute 2: OU (Osmania University)
  ['OUCE', 'UNIVERSITY COLLEGE OF ENGINEERING OSMANIA UNIVERSITY', 'Amberpet', 'HYD', 'CSE', 'COMPUTER SCIENCE AND ENGINEERING', 'BC_A', 'M', 2500, 2023],
  ['OUCE', 'UNIVERSITY COLLEGE OF ENGINEERING OSMANIA UNIVERSITY', 'Amberpet', 'HYD', 'CSE', 'COMPUTER SCIENCE AND ENGINEERING', 'OC', 'M', 800, 2023],
  
  // Institute 3: CBIT (Private Top Tier)
  ['CBIT', 'CHAITANYA BHARATHI INSTITUTE OF TECHNOLOGY', 'Gandipet', 'RR', 'CSE', 'COMPUTER SCIENCE AND ENGINEERING', 'OC', 'M', 1500, 2023],
  ['CBIT', 'CHAITANYA BHARATHI INSTITUTE OF TECHNOLOGY', 'Gandipet', 'RR', 'ECE', 'ELECTRONICS AND COMMUNICATION ENGINEERING', 'OC', 'M', 3500, 2023],
  
  // Institute 4: VNR VJIET
  ['VNRV', 'VNR VIGNANA JYOTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY', 'Bachupally', 'HYD', 'CSE', 'COMPUTER SCIENCE AND ENGINEERING', 'OC', 'M', 2200, 2023],
  ['VNRV', 'VNR VIGNANA JYOTHI INSTITUTE OF ENGINEERING AND TECHNOLOGY', 'Bachupally', 'HYD', 'IT', 'INFORMATION TECHNOLOGY', 'OC', 'M', 4500, 2023]
];

const seed = async () => {
  try {
    console.log('Seeding data...');
    
    // Clear existing data (optional, be careful)
    // await db.query('DELETE FROM cutoff_ranks');

    const queryText = `
      INSERT INTO cutoff_ranks (
        institute_code, institute_name, place, district_code, 
        branch_code, branch_name, category, gender, closing_rank, year
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    for (const row of seedData) {
      await db.query(queryText, row);
    }

    console.log('Successfully seeded dummy EAMCET data!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
