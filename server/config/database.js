const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log('📡 Cluster: cluster0.xnh8888.mongodb.net');
    console.log('🏢 Database: farmconnect');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    // MongoDB Atlas SRV ("mongodb+srv://") relies on DNS SRV lookups.
    // On some Windows setups, Node may be configured to use a loopback DNS proxy (127.0.0.1)
    // that refuses SRV queries, resulting in: querySrv ECONNREFUSED _mongodb._tcp.<cluster>.
    // If detected, switch Node's DNS servers to known-good resolvers (or user-provided ones).
    try {
      const currentServers = dns.getServers();
      const isLoopbackOnly =
        currentServers.length === 1 &&
        (currentServers[0] === '127.0.0.1' || currentServers[0] === '::1');

      if (isLoopbackOnly) {
        const fallbackServers = (process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        if (fallbackServers.length > 0) {
          dns.setServers(fallbackServers);
          console.log(
            `🛠️  DNS override enabled for SRV lookups: ${fallbackServers.join(', ')}`
          );
        }
      }
    } catch {
      // If DNS override fails, continue and let connection attempt report the root error.
    }

    // Set connection timeout options
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      retryWrites: true,
      w: 'majority'
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔌 Connection State: ${conn.connection.readyState === 1 ? 'Connected (1)' : 'Disconnected'}`);
    console.log(`📁 Collections will be created automatically when data is added`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;

  } catch (error) {
    console.error('\n❌ MongoDB Connection FAILED!');
    console.error('📋 Error Details:', error.message);
    
    if (error.message.includes('MONGODB_URI')) {
      console.log('\n💡 Solution:');
      console.log('   1. Check .env file exists in project root');
      console.log('   2. Ensure MONGODB_URI is set correctly');
      console.log('   3. Verify connection string format');
    } else if (error.message.includes('authentication') || error.message.includes('auth')) {
      console.log('\n💡 Authentication Issue:');
      console.log('   1. Check username: vidhi3121');
      console.log('   2. Check password is correct');
      console.log('   3. Verify user exists in MongoDB Atlas Database Access');
      console.log('   4. Ensure password is URL encoded (@ = %40)');
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.log('\n💡 Network/Timeout Issue:');
      console.log('   1. Check internet connection');
      console.log('   2. Verify cluster URL: cluster0.xnh8888.mongodb.net');
      console.log('   3. Check if IP is whitelisted in MongoDB Atlas');
      console.log('   4. Try again - sometimes Atlas takes time to respond');
    }
    
    console.log('\n⚠️  Server will continue to run but database features will not work');
    console.log('📚 Check: MONGODB_COLLECTIONS_INFO.md for setup help\n');
    
    // Don't exit - let server run without database
    return null;
  }
};

module.exports = connectDB;
