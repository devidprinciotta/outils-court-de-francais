// netlify/functions/gemini.js
const { GoogleGenAI } = require('@google/genai');

exports.handler = async (event) => {
  // La clé API est lue depuis les variables d'environnement de Netlify.
  const apiKey = process.env.GEMINI_API_KEY; 
  
  // Vérifie si la clé est présente (l'étape cruciale pour la sécurité)
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "j'en ai marre " }),
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  // Récupère les données envoyées par votre front-end (index.html)
  try {
    const { model, contents } = JSON.parse(event.body);

    const response = await ai.models.generateContent({ model, contents });

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to communicate with Gemini API or process request.' }),
    };
  }
};

