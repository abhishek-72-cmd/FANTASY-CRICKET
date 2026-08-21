const {Resend} = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);


const sendOtpMail = async (email, otp, type) => {
    try {
        const subject =
            type === 'registration'
                ? 'Fantasy Cricket Registration OTP'
                : 'Fantasy Cricket Password Reset OTP';

        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to: [email],    
            subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${subject}</title>
                </head>

                <body style="
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    font-family: Arial, Helvetica, sans-serif;
                ">

                    <div style="
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        padding: 30px;
                        border-radius: 8px;
                    ">

                        <h2 style="
                            margin-top: 0;
                            color: #222222;
                        ">
                            Fantasy Cricket
                        </h2>

                        <p style="
                            font-size: 16px;
                            color: #444444;
                        ">
                            Your OTP is:
                        </p>

                        <div style="
                            margin: 25px 0;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            color: #111111;
                        ">
                            ${otp}
                        </div>

                        <p style="
                            font-size: 14px;
                            color: #555555;
                        ">
                            This OTP is valid for 10 minutes.
                        </p>

                        <p style="
                            font-size: 14px;
                            color: #555555;
                        ">
                            If you did not request this OTP, please ignore this email.
                        </p>

                    </div>

                </body>
                </html>
            `
        });

        if (error) {
            console.error('Resend email error:', error);
            throw new Error('Failed to send OTP email');
        }

        console.log(`OTP email sent successfully to ${email}. Email ID: ${data.id}`);

        return data;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

module.exports = {
    sendOtpMail
};

