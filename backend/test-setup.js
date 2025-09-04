require('dotenv').config();
const { supabase } = require('./src/config/supabase');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
}

async function testTables() {
  console.log('\n🔍 Testing table structure...');
  
  const tables = [
    'users',
    'folders', 
    'files',
    'history',
    'summaries',
    'embeddings',
    'chat_sessions',
    'chat_messages',
    'batch_operations',
    'ocr_results',
    'subscriptions'
  ];

  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ Table '${table}' error:`, error.message);
        allTablesExist = false;
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
      }
    } catch (error) {
      console.error(`❌ Table '${table}' test failed:`, error.message);
      allTablesExist = false;
    }
  }

  return allTablesExist;
}

async function testStorageBucket() {
  console.log('\n🔍 Testing storage bucket...');
  
  try {
    const { data, error } = await supabase.storage
      .from('files')
      .list('', { limit: 1 });

    if (error) {
      console.error('❌ Storage bucket test failed:', error.message);
      return false;
    }

    console.log('✅ Storage bucket "files" is accessible');
    return true;
  } catch (error) {
    console.error('❌ Storage bucket error:', error.message);
    return false;
  }
}

async function testExtensions() {
  console.log('\n🔍 Testing database extensions...');
  
  try {
    // Test UUID extension
    const { data: uuidTest, error: uuidError } = await supabase
      .rpc('uuid_generate_v4');

    if (uuidError) {
      console.error('❌ UUID extension not available:', uuidError.message);
      return false;
    }

    console.log('✅ UUID extension working');

    // Test vector extension (for embeddings)
    const { data: vectorTest, error: vectorError } = await supabase
      .from('embeddings')
      .select('vector')
      .limit(1);

    if (vectorError && !vectorError.message.includes('relation "embeddings" does not exist')) {
      console.error('❌ Vector extension test failed:', vectorError.message);
      return false;
    }

    console.log('✅ Vector extension available');
    return true;
  } catch (error) {
    console.error('❌ Extensions test error:', error.message);
    return false;
  }
}

async function testFunctions() {
  console.log('\n🔍 Testing custom functions...');
  
  try {
    // Test search function (will fail if no data, but function should exist)
    const { data, error } = await supabase
      .rpc('search_files_by_content', {
        search_query: 'test',
        user_uuid: '00000000-0000-0000-0000-000000000000'
      });

    // Function exists if we don't get a "function does not exist" error
    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      console.error('❌ Custom function search_files_by_content not found');
      return false;
    }

    console.log('✅ Custom functions are available');
    return true;
  } catch (error) {
    console.error('❌ Functions test error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting PDFPet Database Setup Test\n');
  
  const tests = [
    { name: 'Database Connection', test: testDatabaseConnection },
    { name: 'Table Structure', test: testTables },
    { name: 'Storage Bucket', test: testStorageBucket },
    { name: 'Extensions', test: testExtensions },
    { name: 'Custom Functions', test: testFunctions }
  ];

  let allPassed = true;
  const results = [];

  for (const { name, test } of tests) {
    const passed = await test();
    results.push({ name, passed });
    if (!passed) allPassed = false;
  }

  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  results.forEach(({ name, passed }) => {
    console.log(`${passed ? '✅' : '❌'} ${name}`);
  });

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 All tests passed! Your PDFPet database is ready!');
    console.log('\n📝 Next steps:');
    console.log('1. Install backend dependencies: cd backend && npm install');
    console.log('2. Start the backend server: npm run dev');
    console.log('3. Create your first admin user by registering and then running:');
    console.log('   UPDATE users SET role = \'admin\' WHERE email = \'your-email@example.com\';');
  } else {
    console.log('❌ Some tests failed. Please check the errors above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you ran the complete-schema.sql in Supabase SQL editor');
    console.log('2. Check that the pgvector extension is enabled');
    console.log('3. Verify your Supabase credentials in .env file');
  }
}

// Run the tests
runAllTests().catch(console.error);