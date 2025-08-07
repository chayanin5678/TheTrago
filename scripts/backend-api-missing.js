// Missing API Endpoints สำหรับ TheTrago Backend Server
// เพิ่ม endpoints เหล่านี้ลงใน server.js

// 1. GET /memberid - ดึง member ID ล่าสุด
app.get('/memberid', (req, res) => {
  const query = `
    SELECT 
      MAX(md_member_no) AS newMemberId
    FROM 
      md_member
    WHERE 
      md_member_no REGEXP '^M[0-9]{6}$'
    ORDER BY 
      md_member_id DESC 
    LIMIT 1
  `;

  pool.query(query, [], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ status: 'error', message: 'Error retrieving member ID' });
    } else {
      const newMemberId = results[0]?.newMemberId || 'M000000';
      res.status(200).json({ 
        status: 'success', 
        newMemberId: newMemberId 
      });
    }
  });
});

// 2. GET /checkemail/:email - ตรวจสอบอีเมลซ้ำ
app.get('/checkemail/:email', (req, res) => {
  const { email } = req.params;
  
  const query = `
    SELECT 
      md_member_email,
      md_member_id
    FROM 
      md_member 
    WHERE 
      md_member_email = ?
  `;

  pool.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ status: 'error', message: 'Error checking email' });
    } else {
      if (results.length > 0) {
        res.status(200).json({ 
          status: 'success', 
          message: 'Email exists',
          data: results 
        });
      } else {
        res.status(200).json({ 
          status: 'success', 
          message: 'Email not found',
          data: [] 
        });
      }
    }
  });
});

// 3. POST /member - สร้างสมาชิกใหม่
app.post('/member', async (req, res) => {
  const {
    md_member_no, md_member_user, md_member_pass, md_member_upline,
    md_member_fname, md_member_lname, md_member_email, md_member_passport_status,
    md_member_bankID, md_member_bank_status, md_member_status, md_member_affiliate_status,
    md_member_logintype, md_member_referral_id, md_member_credate, md_member_update
  } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(md_member_pass, 12);

    const query = `
      INSERT INTO md_member (
        md_member_no, md_member_user, md_member_pass, md_member_upline,
        md_member_fname, md_member_lname, md_member_email, md_member_passport_status,
        md_member_bankID, md_member_bank_status, md_member_status, md_member_affiliate_status,
        md_member_logintype, md_member_referral_id, md_member_credate, md_member_update
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      md_member_no, md_member_user, hashedPassword, md_member_upline || 0,
      md_member_fname, md_member_lname, md_member_email, md_member_passport_status || 3,
      md_member_bankID || 0, md_member_bank_status || 3, md_member_status || 1, 
      md_member_affiliate_status || 0, md_member_logintype || 0, 
      md_member_referral_id || '', md_member_credate, md_member_update
    ];

    pool.query(query, values, (err, results) => {
      if (err) {
        console.error('Error creating member:', err);
        res.status(500).json({ status: 'error', message: 'Error creating member' });
      } else {
        res.status(201).json({ 
          status: 'success', 
          message: 'Member created successfully',
          memberId: md_member_no,
          data: results 
        });
      }
    });

  } catch (error) {
    console.error('Password hashing error:', error);
    res.status(500).json({ status: 'error', message: 'Error during password hashing' });
  }
});

// 4. GET /profile - ดึงข้อมูลโปรไฟล์
app.get('/profile', (req, res) => {
  // ต้องตรวจสอบ JWT token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, 'SECRET_KEY');
    const userId = decoded.id;

    const query = `
      SELECT 
        md_member_id,
        md_member_no,
        md_member_user,
        md_member_fname,
        md_member_lname,
        md_member_email,
        md_member_tel,
        md_member_credate,
        md_member_referral_id,
        md_member_upline
      FROM 
        md_member 
      WHERE 
        md_member_id = ?
    `;

    pool.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ status: 'error', message: 'Error retrieving profile' });
      } else {
        if (results.length > 0) {
          res.status(200).json({ 
            status: 'success', 
            data: results,
            memberId: results[0].md_member_no
          });
        } else {
          res.status(404).json({ 
            status: 'error', 
            message: 'Profile not found' 
          });
        }
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
});

// 5. POST /Token - บันทึก token
app.post('/Token', (req, res) => {
  const { email, token } = req.body;

  const query = `
    UPDATE md_member 
    SET md_member_token = ?, md_member_update = NOW()
    WHERE md_member_email = ?
  `;

  pool.query(query, [token, email], (err, results) => {
    if (err) {
      console.error('Error updating token:', err);
      res.status(500).json({ status: 'error', message: 'Error updating token' });
    } else {
      res.status(200).json({ 
        status: 'success', 
        message: 'Token updated successfully' 
      });
    }
  });
});

// 6. GET /user-profile - API fallback สำหรับโปรไฟล์ (เก่า)
app.get('/user-profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    const userId = decoded.id;

    const query = `
      SELECT 
        md_member_id,
        md_member_no AS memberId,
        md_member_fname AS firstName,
        md_member_lname AS lastName,
        md_member_email AS email,
        md_member_tel AS phone
      FROM 
        md_member 
      WHERE 
        md_member_id = ?
    `;

    pool.query(query, [userId], (err, results) => {
      if (err) {
        res.status(500).json({ success: false, message: 'Database error' });
      } else {
        if (results.length > 0) {
          res.status(200).json({ 
            success: true, 
            user: results[0]
          });
        } else {
          res.status(404).json({ 
            success: false, 
            message: 'User not found' 
          });
        }
      }
    });

  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// 7. Database table structure ที่อาจต้องเพิ่ม
/*
ALTER TABLE md_member ADD COLUMN md_member_referral_id VARCHAR(20) DEFAULT '';
ALTER TABLE md_member ADD COLUMN md_member_token TEXT;
ALTER TABLE md_member ADD COLUMN md_member_upline VARCHAR(20) DEFAULT '0';
*/
