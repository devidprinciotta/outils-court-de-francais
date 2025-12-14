// ...
  const ai = new GoogleGenAI({ apiKey });

  // 5. Extraction du prompt depuis le corps de la requête POST
  let prompt;
  
  if (event.body) {
    try {
      const body = JSON.parse(event.body);
      prompt = body.prompt;
    } catch (e) {
        // En cas d'échec de la lecture de JSON
        console.error("Erreur de parsing JSON:", e);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Format JSON de la requête invalide." }),
        };
    }
  }

  if (!prompt) {
    // Le prompt est manquant ou le body était vide
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Prompt manquant dans la requête." }),
    };
  }
// ... le reste du code de l'IA
