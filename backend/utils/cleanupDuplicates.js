// Utility script to clean up duplicate emails in MongoDB
// Run this once to fix any existing duplicates

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const cleanupDuplicates = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users and group by email (case-insensitive)
    const users = await User.find({});
    const emailMap = {};

    users.forEach(user => {
      const normalizedEmail = user.email.toLowerCase().trim();
      if (!emailMap[normalizedEmail]) {
        emailMap[normalizedEmail] = [];
      }
      emailMap[normalizedEmail].push(user._id);
    });

    // Delete duplicates (keep the first one)
    let deletedCount = 0;
    for (const email in emailMap) {
      if (emailMap[email].length > 1) {
        const idsToDelete = emailMap[email].slice(1);
        await User.deleteMany({ _id: { $in: idsToDelete } });
        deletedCount += idsToDelete.length;
        console.log(`🗑️  Deleted ${idsToDelete.length} duplicate user(s) with email: ${email}`);
      }
    }

    console.log(`\n✅ Cleanup completed. Deleted ${deletedCount} duplicate user(s)`);

    // Drop the old unique index and recreate it properly
    try {
      await User.collection.dropIndex('email_1');
      console.log('🔄 Dropped old email index');
    } catch (e) {
      console.log('ℹ️  No old index found to drop');
    }

    // Recreate the unique index
    await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('✅ Created new unique index on email field');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
};

cleanupDuplicates();
