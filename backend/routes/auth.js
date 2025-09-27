const express = require('express');
const db = require('../db');
const { hashPassword, comparePasswords, generateToken } = require('../utils/auth');

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
  console.log('📝 Signup attempt:', { 
    username: req.body.username, 
    email: req.body.email 
  });
  
  const { username, email, password } = req.body;

  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'All fields (username, email, password) are required.' 
    });
  }

  // Password strength validation
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      message: 'Password must be at least 6 characters long.' 
    });
  }

  try {
    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2', 
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.email === email) {
        console.log('❌ Email already exists:', email);
        return res.status(409).json({ 
          success: false,
          message: 'Email already exists.' 
        });
      }
      if (existing.username === username) {
        console.log('❌ Username already exists:', username);
        return res.status(409).json({ 
          success: false,
          message: 'Username already exists.' 
        });
      }
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const hashedPassword = await hashPassword(password);

    // Insert new user into database
    console.log('💾 Saving user to database...');
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    const newUser = result.rows[0];
    console.log('✅ User created successfully:', { id: newUser.id, username: newUser.username });

    // Generate JWT token
    const token = generateToken(newUser.id);
    console.log('🎫 JWT token generated for new user:', newUser.id);

    // Send success response
    res.status(201).json({ 
      success: true,
      message: 'User created successfully', 
      token, 
      user: { 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email 
      } 
    });

  } catch (error) {
    console.error('💥 Signup error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({ 
        success: false,
        message: 'Username or email already exists.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during signup',
      error: error.message 
    });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  console.log('🔐 Login attempt:', { email: req.body.email });
  
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Email and password are required.' 
    });
  }

  try {
    // 1. Find the user by email
    console.log('📋 Searching for user in database...');
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];
    console.log('✅ User found:', { id: user.id, username: user.username });

    // 2. Compare passwords - handle both hashed and plain text (for migration)
    console.log('🔑 Comparing passwords...');
    let isPasswordValid = false;

    // Try bcrypt comparison first (for hashed passwords)
    isPasswordValid = await comparePasswords(password, user.password);

    // If bcrypt fails, check if it's a plain text match (for existing users)
    if (!isPasswordValid && user.password === password) {
      console.log('⚠️ Using plain text password match - consider hashing passwords');
      isPasswordValid = true;
      
      // Auto-hash the password for future security
      try {
        const hashedPassword = await hashPassword(password);
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
        console.log('✅ Auto-hashed password for user:', user.id);
      } catch (hashError) {
        console.error('⚠️ Failed to auto-hash password:', hashError);
      }
    }
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    console.log('✅ Password validated successfully');

    // 3. Generate JWT token
    const token = generateToken(user.id);
    console.log('🎫 JWT token generated for user:', user.id);

    // 4. Send success response
    res.status(200).json({ 
      success: true,
      message: 'Login successful', 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      } 
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: error.message 
    });
  }
});

// Get current user profile (protected route)
router.get('/me', async (req, res) => {
  // This would require authentication middleware
  // For now, it's a placeholder
  res.status(501).json({ 
    success: false,
    message: 'Profile endpoint not implemented yet' 
  });
});

// Health check for auth routes
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT 1');
    res.json({ 
      success: true,
      status: 'Auth routes and database are working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      status: 'Database connection failed',
      error: error.message 
    });
  }
});

// Get all users (for testing - remove in production)
router.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, email FROM users');
    res.json({ 
      success: true,
      users: result.rows 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
});

module.exports = router;