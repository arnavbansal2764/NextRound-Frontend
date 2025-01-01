import nodemailer from 'nodemailer';
import { getTransporter } from './getTransporter';

// const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//       user: "sihdemo012@gmail.com",
//       pass: "Sih_demo@123",
//     },
//   });


export async function sendMail(recipient:string, subject:string, text:string, html:any) {
    try{
      const transporter = await getTransporter();
    const info = await transporter.sendMail({
        from: "CareerBridge <jeanette.cronin47@ethereal.email> ", 
        to: recipient,
        subject: subject, 
        text: text,
        html: html
    });
    console.log(info.messageId)
    }catch(e){
      console.log("Error: ",e)
    }
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

