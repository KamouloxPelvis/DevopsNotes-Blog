import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Article } from './models/Article';
import { uploadToR2 } from './services/r2Service';

async function migrate() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI manquante dans le .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connecté à MongoDB");

  const articles = await Article.find({ imageUrl: { $exists: true, $ne: '' } });

  for (const article of articles) {
    if (!article.imageUrl) continue;

    // On ignore si c'est déjà sur R2
    if (article.imageUrl.includes('r2.dev')) continue;

    try {
      // Nettoyage du nom de fichier (on retire le préfixe /uploads/)
      const fileName = article.imageUrl.split('/').pop();
      if (!fileName) continue;

      // Chemin absolu vers le fichier sur ton PC
      const filePath = path.join(__dirname, 'uploads', fileName);

      if (!fs.existsSync(filePath)) {
        console.error(`⚠️ Fichier introuvable sur le disque : ${filePath}`);
        continue;
      }

      console.log(`🚀 Migration de : ${fileName} ...`);

      // 1. Lecture du fichier local
      const buffer = fs.readFileSync(filePath);

      // 2. Préparation pour R2
      const fakeFile: any = {
        buffer: buffer,
        originalname: fileName,
        mimetype: fileName.endsWith('.png') ? 'image/png' : 'image/jpeg'
      };

      // 3. Upload et optimisation Sharp
      const newUrl = await uploadToR2(fakeFile);

      // 4. Mise à jour MongoDB
      article.imageUrl = newUrl;
      await article.save();
      
      console.log(`✅ Succès ! Nouvelle URL : ${newUrl}`);
    } catch (error: any) {
      console.error(`❌ Erreur pour ${article.title}:`, error.message);
    }
  }

  console.log('--- Migration terminée ! ---');
  process.exit();
}

migrate();