const transporter = require('./transporter');

const sendOtpMail = async (email, otp, type) => {

    const subject =
        type === 'registration'
            ? 'Fantasy Cricket Registration OTP'
            : 'Fantasy Cricket Password Reset OTP';

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html: `
            <h2>Fantasy Cricket</h2>

            <p>Your OTP is:</p>

            <h1>${otp}</h1>

            <p>Valid for 10 minutes.</p>
        `
    });
};

module.exports = {
    sendOtpMail
};