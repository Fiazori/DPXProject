const express = require('express');
const db = require('../util/db');
const sendEmail = require('../util/mailer');
const crypto = require('crypto');
const validator = require('validator');
const router = express.Router();

// 生成验证码
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// 1. 生成验证码并发送邮件
router.post('/send-code', async (req, res) => {
    let { email, code_type } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    email = validator.normalizeEmail(email); 
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }



    try {
        // 检查邮箱是否已注册
        const checkEmailQuery = `SELECT * FROM DPX_USERS WHERE email = ?`;
        const [rows] = await db.execute(checkEmailQuery, [email]);

        if (code_type === 'R') {
            // 注册：邮箱已注册则返回错误
            if (rows.length > 0) {
                return res.status(409).json({ message: 'Email is already in use' });
            }
        } else if (code_type === 'C') {
            // 修改密码：邮箱未注册则返回错误
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Account does not exist' });
            }
        } else if (code_type === 'D') {
            // 删除账号：账号已被删除
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Account does not exist' });
            }
        } else {
            return res.status(500).json({ message: 'Failed to send verification code due to server error' });
        }

        // 生成验证码
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 验证码有效期5分钟

        const query = `INSERT INTO DPX_OTP_CODE (email, otp_code, code_type, expires_at)
                       VALUES (?, ?, ?, ?)
                       ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?`;
        await db.execute(query, [email, otpCode, code_type, expiresAt, otpCode, expiresAt]);

        // 发送验证码邮件
        if (code_type === 'R') {
            await sendEmail(email, 'Welcome to DPX Cruise - Verify Your Email', 
            `Thank you for signing up with DPX Cruise! To complete your registration, please use the verification code: ${otpCode}. This code is valid for 5 minutes. If you did not request this, please ignore this email.`);
        } else if (code_type === 'C') {
            await sendEmail(email, 'DPX Cruise - Password Reset Verification Code',
                 `We received a request to reset your password. Please use the verification code: ${otpCode}. This code is valid for 5 minutes. If you did not request a password reset, please ignore this email or contact our support team.`);
        } else if (code_type === 'D') {
            await sendEmail(email, 'DPX Cruise - Account Deletion Confirmation',
                 `We received a request to delete your account. To confirm this action, please use the verification code ${otpCode}. This code is valid for 5 minutes. If you did not request to delete your account, please contact our support team immediately.`);
        }
        res.status(200).json({ message: 'Verification code sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send verification code', details: err.message });
    }
});


// 2. 验证验证码
// router.post('/verify-code', async (req, res) => {
//     const { email, otpCode } = req.body;
//     if (!email || !otpCode) {
//         return res.status(400).json({ message: 'Email and verification code are required' });
//     }
//     if (!code_type_) {
//         return res.status(500).json({ message: 'Failed due to server error' });
//     }

//     try {
//         const query = `SELECT * FROM DPX_OTP_CODE 
//                        WHERE email = ? AND otp_code = ? AND code_type = ? AND expires_at > NOW()`;
//         const [rows] = await db.execute(query, [email, otpCode, code_type]);

//         if (rows.length === 0) {
//             return res.status(400).json({ message: 'Invalid or expired verification code' });
//         }

//         res.status(200).json({ message: 'Verification successful' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Failed to verify code', details: err.message });
//     }
// });

module.exports = router;
