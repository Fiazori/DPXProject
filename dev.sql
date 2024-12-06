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

DELETE FROM DPX_USERS WHERE email = 'dinghengyan@gmail.com';

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

select * from dpx_users;
select * from dpx_otp_code;

SELECT * FROM DPX_USERS WHERE email = 'dy';


-- test
-- dpx_trip
CREATE TABLE dpx_trip (
    tripid     INT AUTO_INCREMENT PRIMARY KEY,
    night      INT NOT NULL COMMENT 'The total number of nights',
    startdate  DATE NOT NULL COMMENT 'The start date of the trip',
    enddate    DATE NOT NULL COMMENT 'The end date of the trip',
    is_active  CHAR(1) NOT NULL COMMENT 'Indicates if the trip is currently active and bookable ("Y" for Yes, "N" for No)',
    start_port INT NOT NULL,
    end_port   INT NOT NULL
--     FOREIGN KEY (start_port) REFERENCES dpx_port(portid),
--     FOREIGN KEY (end_port) REFERENCES dpx_port(portid)
);

-- 插入测试数据到 dpx_trip 表
INSERT INTO dpx_trip (night, startdate, enddate, is_active, start_port, end_port)
VALUES 
(7, '2024-12-10', '2024-12-17', 'Y', 1, 2), -- Example trip 1
(5, '2024-12-15', '2024-12-20', 'Y', 2, 3), -- Example trip 2
(10, '2024-12-01', '2024-12-11', 'N', 1, 4), -- Example trip 3 (inactive)
(3, '2024-12-05', '2024-12-08', 'Y', 3, 1), -- Example trip 4
(14, '2024-12-20', '2025-01-03', 'Y', 4, 2); -- Example trip 5

select * from dpx_trip;
