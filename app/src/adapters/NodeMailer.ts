"use strict";
import nodemailer from "nodemailer";

interface PropsTransporter_I {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface PropsSend_I {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: { filename: string; path?: string; content?: Buffer }[];
}

interface PropsAdapterNodeMailer_I {
  send: PropsSend_I;
  transporter: PropsTransporter_I;
}

async function sendEmail(props: PropsAdapterNodeMailer_I) {
  const transporter = nodemailer.createTransport(props.transporter);
  await transporter.sendMail(props.send);
}

export { sendEmail };
