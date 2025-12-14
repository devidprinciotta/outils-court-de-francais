// proxygemini/functions/index.mjs

exports.handler = async (event) => {
  // 1. Utilisation de l'importation dynamique pour contourner l'erreur ERR_REQUIRE_ESM
  const { GoogleGenAI } = await import('@google/genai');

  // 2. Lecture de la clé API depuis les variables d'environnement de Netlify
  const apiKey = process.env.GEMINI_API_KEY; 

  // --- LIGNE DE DIAGNOSTIC CRUCIALE ---
  console.log('API Key Status:', apiKey ? 'Key found' : 'Key missing'); 
  // ------------------------------------

  // 3. Vérifie si la clé est présente (le point de défaillance supposé)
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "FATAL ERROR: Clé API Netlify non lue." }), 
    };
  }

  // 4. Instanciation du client Gemini
  const ai = new GoogleGenAI({ apiKey });

  // 5. Extraction du prompt depuis le corps de la requête POST
  const { prompt } = JSON.parse(event.body);

  if (!prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Prompt manquant dans la requête." }),
    };
  }

  try {
    // 6. Appel à l'API Gemini
    const response = await ai.models.generateContent({
      model: 'flash-preview-09-2025:generateContent', // Votre modèle personnalisé
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    // 7. Retour de la réponse de l'IA au client
    return {
      statusCode: 200,
      body: JSON.stringify({ result: response.text }),
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to communicate with Gemini API or process request." }),
    };
  }
};
