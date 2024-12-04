const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../util/db');
require('dotenv').config();
const validator = require('validator');
const router = express.Router();
const SALT_ROUNDS = 10;
const SECRET_KEY = '6fca7b156f42c1b0e764b21d768c2680a492e62be11468373ec68eff3b70c0115e4c6bf5e12f24d3292fad01a954c00d9abb1d9e5a8fc511f21324d488ded4ec'; // 建议使用环境变量


// 注册接口
router.post('/register', async (req, res) => {
    const { username, password, email, role, otpCode } = req.body;
    
    // 验证输入是否完整
    if (!username || !password || !email || !otpCode) {
        return res.status(400).json({ message: 'Username, password, email, and OTP code are required' });
    }

    try {
        // 验证验证码
        const checkOTPQuery = `
            SELECT * FROM DPX_OTP_CODE
            WHERE email = ? AND otp_code = ? AND code_type = 'R' AND expires_at > NOW()
        `;
        const [otpRows] = await db.execute(checkOTPQuery, [email, otpCode]);
        
        if (otpRows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }


        // 加密密码并注册用户
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const insertQuery = `INSERT INTO DPX_USERS (username, password_hash, email, role) VALUES (?, ?, ?, ?)`;
        await db.execute(insertQuery, [username, hashedPassword, email, role || 'customer']);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Registration failed', details: err.message });
    }
});

// 忘记密码接口
router.post('/reset-password', async (req, res) => {
    const { email, otpCode, newPassword } = req.body;

    // 验证输入是否完整
    if (!otpCode || !newPassword) {
        return res.status(400).json({ message: 'OTP code and new password are required' });
    }

    try {
        // 验证验证码
        const checkOTPQuery = `
            SELECT * FROM DPX_OTP_CODE
            WHERE email = ? AND otp_code = ? AND code_type = 'C' AND expires_at > NOW()
        `;
        const [otpRows] = await db.execute(checkOTPQuery, [email, otpCode]);

        if (otpRows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // 更新密码
        const updatePasswordQuery = `
            UPDATE DPX_USERS 
            SET password_hash = ? 
            WHERE email = ?
        `;
        await db.execute(updatePasswordQuery, [hashedPassword, email]);

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Password reset failed', details: err.message });
    }
});

// 登录接口
router.post('/login', async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    email = validator.normalizeEmail(email);
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }


    try {
        const query = `SELECT * FROM DPX_USERS WHERE email = ?`;
        const [rows] = await db.execute(query, [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, username: user.username, role: user.role, user_email: user.email },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({ token }); // 将 Token 返回给前端
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// 更改用户名接口
router.put('/change-username', async (req, res) => {
    const { email, username } = req.body;

    if (!email || !username) {
        return res.status(400).json({ message: 'Email and username are required' });
    }

    try {
        const checkEmailQuery = `SELECT * FROM DPX_USERS WHERE email = ?`;
        const [rows] = await db.execute(checkEmailQuery, [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updateUsernameQuery = `UPDATE DPX_USERS SET username = ? WHERE email = ?`;
        await db.execute(updateUsernameQuery, [username, email]);

        // 获取用户信息
        const updatedUserQuery = `SELECT * FROM DPX_USERS WHERE email = ?`;
        const [updatedRows] = await db.execute(updatedUserQuery, [email]);
        const updatedUser = updatedRows[0];

        // 生成新的 token
        const newToken = jwt.sign(
            { user_id: updatedUser.user_id, username: updatedUser.username, role: updatedUser.role, user_email: updatedUser.email },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Username updated successfully', token: newToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update username', details: err.message });
    }
});


// 更改密码接口
router.put('/change-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' });
    }

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old password and new password are required' });
    }

    try {
        // 解码用户信息
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.user_id;

        // 获取用户当前密码哈希值
        const query = `SELECT password_hash FROM DPX_USERS WHERE user_id = ?`;
        const [rows] = await db.execute(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        // 加密新密码并更新
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        const updatePasswordQuery = `UPDATE DPX_USERS SET password_hash = ? WHERE user_id = ?`;
        await db.execute(updatePasswordQuery, [hashedPassword, userId]);

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update password', details: err.message });
    }
});

// 删除账户接口
router.delete('/delete-account', async (req, res) => {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
        return res.status(400).json({ message: 'Email and OTP code are required' });
    }

    try {
        // 验证验证码
        const checkOTPQuery = `
            SELECT * FROM DPX_OTP_CODE
            WHERE email = ? AND otp_code = ? AND code_type = 'D' AND expires_at > NOW()
        `;
        const [otpRows] = await db.execute(checkOTPQuery, [email, otpCode]);

        if (otpRows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // 删除用户
        const deleteUserQuery = `DELETE FROM DPX_USERS WHERE email = ?`;
        await db.execute(deleteUserQuery, [email]);

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete account', details: err.message });
    }
});

module.exports = router;