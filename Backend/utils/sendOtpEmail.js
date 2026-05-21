const nodemialer = require ('nodemailer');

const sendOtpEmail = async (email, otp) =>{
    const transporter = nodemialer.createTransport ({
        service: 'gmail',
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.email_pass
        }
    })
    
}

