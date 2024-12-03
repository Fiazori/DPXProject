const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dpxcruise@gmail.com',
        pass: 'hrut hava bpah aqko',
    },
});

// 发送邮件函数
const sendEmail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: 'dpxcruise@gmail.com',
            to,
            subject,
            text,
        });
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;
