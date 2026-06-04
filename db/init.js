const fs = require('fs');
const path = require('path');
const db = require('./index');

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database schema...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon to execute each statement
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      try {
        await db.query(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      } catch (err) {
        // Some statements might fail if they already exist, which is ok
        if (err.message.includes('already exists')) {
          console.log('ℹ️  Already exists:', statement.substring(0, 50) + '...');
        } else {
          throw err;
        }
      }
    }
    
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

initializeDatabase();
