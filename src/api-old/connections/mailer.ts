import nodemailer from 'nodemailer';

export const mailer = nodemailer.createTransport({
    host: process.env['SMTP_HOST'] || 'localhost',
    port: parseInt(process.env['SMTP_PORT'] || '1025', 10),
});
