import { Resend } from 'resend';

// Initialisation avec la clé API récupérée dans le .env
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: 'DevOpsNotes <hello@devopsnotes.org>', // Utilise l'adresse validée sur Resend
      to: email,
      subject: "Confirmez votre inscription sur DevOpsNotes",
      html: `
        <h1>Bienvenue !</h1>
        <p>Cliquez sur le lien ci-dessous pour activer votre compte :</p>
        <a href="${url}" style="padding: 10px 20px; background: #4299e1; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
          Vérifier mon compte
        </a>
        <p>Si le bouton ne fonctionne pas, copiez ce lien : ${url}</p>
      `,
    });
    console.log(`Email de vérification envoyé à ${email}`);
  } catch (error) {
    console.error("Erreur d'envoi Resend (Vérification):", error);
    throw error;
  }
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const url = `${process.env.FRONTEND_URL_PROD}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: 'DevOpsNotes <security@devopsnotes.org>',
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <p>Vous avez demandé une réinitialisation de mot de passe.</p>
        <p>Cliquez ici pour choisir un nouveau mot de passe (valide 1h) :</p>
        <a href="${url}">${url}</a>
      `,
    });
    console.log(`Email de reset envoyé à ${email}`);
  } catch (error) {
    console.error("Erreur d'envoi Resend (Reset):", error);
    throw error;
  }
};