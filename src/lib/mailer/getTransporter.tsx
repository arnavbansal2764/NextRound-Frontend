import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;


export async function getTransporter() {
    if(!transporter){
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
            auth: {
                user: 'sihdemo012@gmail.com',
                pass: 'qpsi lljx hsgw riav'
            }
        });
      return transporter;
    }
    return transporter;
  
  }