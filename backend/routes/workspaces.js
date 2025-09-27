const express = require('express');
const db = require('../db');
const { verifyToken } = require('../utils/auth');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access token required' 
    });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};

// Create a new workspace
router.post('/', authenticateToken, async (req, res) => {
  console.log('🏢 Creating workspace for user:', req.userId);
  
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ 
      success: false,
      message: 'Workspace name is required' 
    });
  }

  try {
    // Generate a unique 4-digit code
    let code;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = Math.floor(1000 + Math.random() * 9000).toString();
      
      const existing = await db.query(
        'SELECT id FROM workspaces WHERE code = $1',
        [code]
      );
      
      if (existing.rows.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ 
        success: false,
        message: 'Failed to generate unique workspace code' 
      });
    }

    // Create workspace
    const workspaceResult = await db.query(
      `INSERT INTO workspaces (name, code, description, created_by) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, code, description, created_at`,
      [name, code, description, req.userId]
    );

    const workspace = workspaceResult.rows[0];

    // Add creator as owner
    await db.query(
      `INSERT INTO user_workspaces (user_id, workspace_id, role) 
       VALUES ($1, $2, 'owner')`,
      [req.userId, workspace.id]
    );

    console.log('✅ Workspace created:', { id: workspace.id, code: workspace.code });

    res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      workspace: {
        id: workspace.id,
        name: workspace.name,
        code: workspace.code,
        description: workspace.description,
        created_at: workspace.created_at,
        role: 'owner'
      }
    });

  } catch (error) {
    console.error('💥 Workspace creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during workspace creation',
      error: error.message 
    });
  }
});

// Join workspace by code
router.post('/join', authenticateToken, async (req, res) => {
  console.log('🔗 Join workspace attempt:', { 
    userId: req.userId, 
    code: req.body.code 
  });
  
  const { code } = req.body;

  // Validation
  if (!code || code.length !== 4 || !/^\d+$/.test(code)) {
    return res.status(400).json({ 
      success: false,
      message: 'Valid 4-digit workspace code is required' 
    });
  }

  try {
    // Check if workspace exists
    const workspaceResult = await db.query(
      `SELECT w.*, u.username as creator_name 
       FROM workspaces w 
       JOIN users u ON w.created_by = u.id 
       WHERE w.code = $1`,
      [code]
    );

    if (workspaceResult.rows.length === 0) {
      console.log('❌ Workspace not found with code:', code);
      return res.status(404).json({ 
        success: false,
        message: 'Workspace not found with the provided code' 
      });
    }

    const workspace = workspaceResult.rows[0];
    console.log('✅ Workspace found:', { id: workspace.id, name: workspace.name });

    // Check if user is already a member
    const existingMember = await db.query(
      `SELECT role FROM user_workspaces 
       WHERE user_id = $1 AND workspace_id = $2`,
      [req.userId, workspace.id]
    );

    if (existingMember.rows.length > 0) {
      console.log('ℹ️ User already member of workspace');
      return res.status(409).json({ 
        success: false,
        message: 'You are already a member of this workspace',
        workspace: {
          id: workspace.id,
          name: workspace.name,
          code: workspace.code,
          role: existingMember.rows[0].role
        }
      });
    }

    // Add user to workspace as member
    await db.query(
      `INSERT INTO user_workspaces (user_id, workspace_id, role) 
       VALUES ($1, $2, 'member')`,
      [req.userId, workspace.id]
    );

    console.log('✅ User joined workspace:', { 
      userId: req.userId, 
      workspaceId: workspace.id 
    });

    res.status(200).json({
      success: true,
      message: 'Successfully joined the workspace',
      workspace: {
        id: workspace.id,
        name: workspace.name,
        code: workspace.code,
        description: workspace.description,
        creator_name: workspace.creator_name,
        role: 'member'
      }
    });

  } catch (error) {
    console.error('💥 Join workspace error:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ 
        success: false,
        message: 'You are already a member of this workspace' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during workspace join',
      error: error.message 
    });
  }
});

// Get workspace details by code (for preview before joining)
router.get('/code/:code', authenticateToken, async (req, res) => {
  const { code } = req.params;

  if (!code || code.length !== 4 || !/^\d+$/.test(code)) {
    return res.status(400).json({ 
      success: false,
      message: 'Valid 4-digit workspace code is required' 
    });
  }

  try {
    const workspaceResult = await db.query(
      `SELECT w.id, w.name, w.description, w.code, w.created_at,
              u.username as creator_name,
              COUNT(uw.user_id) as member_count
       FROM workspaces w 
       JOIN users u ON w.created_by = u.id
       LEFT JOIN user_workspaces uw ON w.id = uw.workspace_id
       WHERE w.code = $1
       GROUP BY w.id, u.username`,
      [code]
    );

    if (workspaceResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Workspace not found' 
      });
    }

    const workspace = workspaceResult.rows[0];

    // Check if user is already a member
    const userMembership = await db.query(
      `SELECT role FROM user_workspaces 
       WHERE user_id = $1 AND workspace_id = $2`,
      [req.userId, workspace.id]
    );

    res.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        code: workspace.code,
        description: workspace.description,
        creator_name: workspace.creator_name,
        member_count: parseInt(workspace.member_count),
        created_at: workspace.created_at,
        is_member: userMembership.rows.length > 0,
        user_role: userMembership.rows[0]?.role || null
      }
    });

  } catch (error) {
    console.error('💥 Get workspace error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get user's workspaces
router.get('/my-workspaces', authenticateToken, async (req, res) => {
  try {
    const workspacesResult = await db.query(
      `SELECT w.*, uw.role, uw.joined_at,
              (SELECT COUNT(*) FROM user_workspaces WHERE workspace_id = w.id) as member_count
       FROM workspaces w
       JOIN user_workspaces uw ON w.id = uw.workspace_id
       WHERE uw.user_id = $1
       ORDER BY uw.joined_at DESC`,
      [req.userId]
    );

    res.json({
      success: true,
      workspaces: workspacesResult.rows.map(ws => ({
        id: ws.id,
        name: ws.name,
        code: ws.code,
        description: ws.description,
        role: ws.role,
        member_count: parseInt(ws.member_count),
        joined_at: ws.joined_at,
        created_at: ws.created_at
      }))
    });

  } catch (error) {
    console.error('💥 Get workspaces error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get workspace members
router.get('/:workspaceId/members', authenticateToken, async (req, res) => {
  const { workspaceId } = req.params;

  try {
    // Verify user has access to this workspace
    const userAccess = await db.query(
      `SELECT role FROM user_workspaces 
       WHERE user_id = $1 AND workspace_id = $2`,
      [req.userId, workspaceId]
    );

    if (userAccess.rows.length === 0) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied to this workspace' 
      });
    }

    const membersResult = await db.query(
      `SELECT u.id, u.username, u.email, uw.role, uw.joined_at
       FROM user_workspaces uw
       JOIN users u ON uw.user_id = u.id
       WHERE uw.workspace_id = $1
       ORDER BY 
         CASE uw.role 
           WHEN 'owner' THEN 1
           WHEN 'admin' THEN 2
           ELSE 3 
         END, uw.joined_at`,
      [workspaceId]
    );

    res.json({
      success: true,
      members: membersResult.rows
    });

  } catch (error) {
    console.error('💥 Get members error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;