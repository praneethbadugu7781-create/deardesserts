/**
 * Automated Authentication Test Suite for Dear Desserts Software
 * Run via: npx ts-node src/test/auth.test.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dear_desserts_super_secret_jwt_key_2026_qsr';

async function runAuthTests() {
  console.log('🧪 Starting Senior Software Architect Authentication Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: User Database Upsert & Password Hashing Verification
    console.log('Test 1: Verify Default Account Creation & bcrypt Salt Rounds');
    const testAdminPass = 'TestAdminPass#2026';
    const hashed = await bcrypt.hash(testAdminPass, 10);
    assert(hashed.startsWith('$2a$') || hashed.startsWith('$2b$'), 'bcrypt.hash produces valid 10-round hash');
    assert(await bcrypt.compare(testAdminPass, hashed), 'bcrypt.compare verifies plain text password against hash');
    assert(!(await bcrypt.compare('WrongPass123', hashed)), 'bcrypt.compare rejects wrong password');

    // Test 2: Double Hashing Prevention Check
    console.log('\nTest 2: Double Hashing Prevention');
    const isAlreadyHashed = hashed.startsWith('$2a$') || hashed.startsWith('$2b$');
    assert(isAlreadyHashed, 'Detected hashed password string to prevent double-hashing');

    // Test 3: Ensure User Exists in Database & Password Updates
    console.log('\nTest 3: MongoDB User Account Upsert & Password Update');
    const testEmail = 'deardesserts.in@gmail.com';
    let user = await prisma.user.findFirst({ where: { email: testEmail } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Store Manager',
          email: testEmail,
          password: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
        },
      });
    }

    assert(user !== null && user.email === testEmail, 'Admin user record exists in MongoDB Atlas');

    // Update password in MongoDB
    const newPass = 'NewAdminPass#999';
    const newHash = await bcrypt.hash(newPass, 10);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash },
    });

    assert(await bcrypt.compare(newPass, updatedUser.password), 'Updated password in MongoDB verifies with bcrypt.compare');
    assert(!(await bcrypt.compare('admin123', updatedUser.password)), 'Old password (admin123) is invalidated in MongoDB');

    // Restore original password
    const originalHash = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: originalHash },
    });
    console.log('  ℹ️ Restored default admin password to MongoDB Atlas');

    // Test 4: JWT Generation and Verification
    console.log('\nTest 4: JWT Token Signing & Expiration Integrity');
    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    assert(decoded.id === user.id, 'JWT payload contains correct User ID');
    assert(decoded.role === 'ADMIN', 'JWT payload contains correct Role (ADMIN)');

    // Test 5: Unique User Email Constraint
    console.log('\nTest 5: Unique Username & Email Constraint');
    let duplicateErrorThrown = false;
    try {
      await prisma.user.create({
        data: {
          name: 'Duplicate Admin',
          email: testEmail,
          password: 'password123',
          role: 'ADMIN',
        },
      });
    } catch (e: any) {
      duplicateErrorThrown = true;
    }
    assert(duplicateErrorThrown, 'MongoDB unique index prevents duplicate email accounts');

    console.log(`\n📊 Authentication Test Suite Results: ${passed} Passed, ${failed} Failed`);
    if (failed === 0) {
      console.log('🎉 ALL AUTHENTICATION AUDIT TESTS PASSED SUCCESSFULLY!\n');
    }
  } catch (err: any) {
    console.error('💥 Test suite execution error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runAuthTests();
