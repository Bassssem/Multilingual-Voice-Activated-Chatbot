import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import cors from "cors";

// Création de l'application express
const app = express();
const PORT = 3001;

// Middleware pour gérer les requêtes CORS
app.use(cors());

// Configuration de l'API Google Generative AI
const api_key = "AIzaSyCZC1qHjBp8nf0OoE465Aj5VXazwkdtvzI"; // Chargez votre clé API depuis .env
const genAI = new GoogleGenerativeAI(api_key);
const generationConfig = { temperature: 0.9, topP: 1, topK: 1, maxOutputTokens: 4096 };
const model = genAI.getGenerativeModel({ model: "gemini-pro", generationConfig });

// Fonction pour générer du contenu
async function generateContent(question) {
  try {
    const result = await model.generateContent(question);
    return result.response.text(); // Retourne le texte de la réponse générée
  } catch (error) {
    console.error('Error generating content:', error);
    throw error; // Remonte l'erreur pour la gérer plus tard
  }
}

// Route pour gérer les requêtes GET à '/api/v1/model/:question'
app.get('/api/v1/model/:question', async (req, res) => {
  const question = req.params.question;
    console.log(question);
  try {
    const generatedContent = await generateContent(question);
    console.log(generatedContent);
    res.status(200).json({ data: ` ${generatedContent}` });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
