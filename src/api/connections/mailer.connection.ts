import nodemailer from 'nodemailer';

export const mailerConnection = nodemailer.createTransport({
    host: process.env['SMTP_HOST'] || 'localhost',
    port: parseInt(process.env['SMTP_PORT'] || '1025', 10),
});
