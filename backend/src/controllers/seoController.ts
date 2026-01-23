import { Request, Response } from 'express';
import { Article } from '../models/Article';
import { Thread } from '../models/Thread';

export const getSitemap = async (req: Request, res: Response) => {
  try {
    const baseUrl = 'https://www.devopsnotes.org';

    // On récupère les données nécessaires
    const [articles, threads] = await Promise.all([
      Article.find({ status: 'published' }, 'slug updatedAt'),
      Thread.find({}, '_id updatedAt').limit(500) // On récupère _id ici
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>
  <url><loc>${baseUrl}/articles</loc><priority>0.9</priority><changefreq>daily</changefreq></url>
  <url><loc>${baseUrl}/forum</loc><priority>0.9</priority><changefreq>daily</changefreq></url>`;

    // Articles : Identification par Slug
    articles.forEach((art: any) => {
      xml += `
  <url>
    <loc>${baseUrl}/articles/${art.slug}</loc>
    <lastmod>${art.updatedAt.toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`;
    });

    // Forum : Identification par ID (basé sur ta route GET /threads/:id)
    threads.forEach((thread: any) => {
      xml += `
  <url>
    <loc>${baseUrl}/forum/thread/${thread._id}</loc>
    <lastmod>${thread.updatedAt.toISOString()}</lastmod>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error("Sitemap error:", error);
    res.status(500).end();
  }
};