import { google } from 'googleapis';

// On parse la clé stockée dans GitLab
const googleKey = JSON.parse(process.env.GOOGLE_INDEXING_KEY || '{}');

const jwtClient = new google.auth.JWT({
  email: googleKey.client_email,
  key: googleKey.private_key,
  scopes: ['https://www.googleapis.com/auth/indexing']
});

/**
 * Notifie Google d'une nouvelle URL ou d'une mise à jour
 */
export const notifyGoogleIndexing = async (url: string) => {
  try {
    await jwtClient.authorize();
    
    const indexing = google.indexing('v3');
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: 'URL_UPDATED', // Utilise UPDATED pour création ET modification
      },
    });

    console.log(`🚀 Indexation demandée avec succès pour : ${url}`);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur Google Indexing API:", error);
  }
};