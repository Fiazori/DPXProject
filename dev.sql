CREATE DATABASE DPX_PROJECT;
USE DPX_PROJECT;


-- 创建user
CREATE TABLE DPX_USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('customer', 'employee') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 验证码管理
CREATE TABLE DPX_OTP_CODE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,        -- 验证邮箱
    otp_code VARCHAR(6) NOT NULL,       -- 验证码
    code_type ENUM('R', 'C', 'D') NOT NULL, -- 验证码类型：R 注册，C 改密码，D 删除账号
    expires_at TIMESTAMP NOT NULL       -- 验证码过期时间
);

-- 事件调度器
SET GLOBAL event_scheduler = ON;

-- 每分钟自动清理过期验证码
CREATE EVENT IF NOT EXISTS clean_expired_opt_codes
ON SCHEDULE EVERY 1 MINUTE
DO
    DELETE FROM DPX_OTP_CODE
    WHERE expires_at < NOW();
