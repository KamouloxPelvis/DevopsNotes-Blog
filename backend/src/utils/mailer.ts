import nodemailer from "nodemailer";

// DEBUG TEMPORAIRE
console.log("--- DEBUG MAILER CONFIG ---");
console.log("HOST:", process.env.MAIL_HOST);
console.log("USER:", process.env.MAIL_USER ? "Configuré ✅" : "VIDE ❌");
console.log("PASS:", process.env.MAIL_PASS ? "Configuré ✅" : "VIDE ❌");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.MAIL_PORT || 2525),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Erreur de configuration SMTP :", error);
  } else {
    console.log("Serveur de mail prêt à envoyer des messages");
  }
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: '"DevOpsNotes" <no-reply@devopsnotes.org>',
    to: email,
    subject: "Confirmez votre inscription sur DevOpsNotes",
    html: `
      <h1>Bienvenue !</h1>
      <p>Cliquez sur le lien ci-dessous pour activer votre compte :</p>
      <a href="${url}" style="padding: 10px 20px; background: #4299e1; color: white; text-decoration: none; border-radius: 5px;">
        Vérifier mon compte
      </a>
      <p>Si le bouton ne fonctionne pas, copiez ce lien : ${url}</p>
    `,
  });
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: '"DevOpsNotes" <security@devopsnotes.org>',
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <p>Vous avez demandé une réinitialisation de mot de passe.</p>
      <p>Cliquez ici pour choisir un nouveau mot de passe (valide 1h) :</p>
      <a href="${url}">${url}</a>
    `,
  });
};