import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from 'sharp'; // Ajout de sharp

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export const uploadToR2 = async (file: any, folder: string = 'articles') => {
  // 1. Transformation de l'image
  // On génère un buffer optimisé (WebP, 1600px max, qualité 80)
  const optimizedBuffer = await sharp(file.buffer)
    .resize({ 
      width: 1600, 
      withoutEnlargement: true,
      fit: 'inside' 
    })
    .webp({ quality: 80 })
    .toBuffer();

  // 2. On change l'extension du nom de fichier en .webp
  const fileNameWithoutExt = file.originalname.split('.').slice(0, -1).join('.');
  const fileKey = `${folder}/${Date.now()}-${fileNameWithoutExt}.webp`;

  // Exemple avec AWS SDK (utilisé pour R2)
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    Body: optimizedBuffer, // On utilise le buffer optimisé
    ContentType: "image/webp",
    CacheControl: "public, max-age=2592000", // Dit au navigateur de garder l'image 30 jours
  });

  await r2Client.send(command);
  
  const publicUrl = "https://resources.devopsnotes.org";
  return fileKey ;
};

