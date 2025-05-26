import nodemailer from 'nodemailer';

// Function for sending email
export const sendEmailFunction = async (to , subject , text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: 'akashdbg.111@gmail.com',
      pass: 'mwtmlytznoagpsrh',
    },
  });

  const mailOptions = {
    from: 'akashdbg.111@gmail.com',
    to: to,
    subject: subject,
    text: text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return "Email sent successfully!";
  } catch (error) {
    console.error("Error =>", error);
    throw new Error("Failed to send email.");
  }
};
