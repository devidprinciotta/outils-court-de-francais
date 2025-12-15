// proxygemini/functions/gemini-definition.js (CODE FINAL CORRIGÉ)

// 1. Correction : Utilisation de 'require' pour la compatibilité Netlify (CJS)
const { GoogleGenAI } = require("@google/genai");

// Correction : Utilise le nom de clé API que vous avez sur Netlify
const apiKey = process.env.GEMINI_API_KEY; 

// Crée une instance du client Gemini
const ai = new GoogleGenAI({apiKey});

// 2. Correction : La fonction n'est plus exportée directement (syntaxe CJS)
async function handler(event, context) {
    // Vérification de l'absence de clé API
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Configuration Error: GEMINI_API_KEY is missing or invalid." })
        };
    }

    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing request body" })
        };
    }

    let data;
    try {
        // Ajout d'un log pour s'assurer que l'événement est bien reçu
        console.log("Event received. Attempting to parse body...");
        data = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid JSON format" })
        };
    }
    
    // Récupère la clé 'word' envoyée par le client
    const word = data.word; 

    // Définition du prompt
    const prompt = `Explique le mot "${word}" simplement à un enfant de 6 ans. Fournis une définition claire et un exemple de phrase qui utilise ce mot. Réponds uniquement en français. Formate la réponse comme ceci: Définition: [Votre définition]\\nExemple: [Votre exemple].`;

    // Vérification de l'absence de mot
    if (!word) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Missing word in request body" })
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "Tu es un tuteur de vocabulaire pour enfants et un expert en langue française. Ne réponds qu'avec le contenu demandé (Définition et Exemple), sans aucun dialogue supplémentaire.",
                temperature: 0.2, 
                // Activation de la recherche Google pour les sources
                tools: [{ googleSearch: {} }], 
            }
        });

        // Extraction du texte et des sources
        const resultText = response.text;
        
        let sources = [];
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        if (groundingMetadata && groundingMetadata.groundingAttributions) {
            sources = groundingMetadata.groundingAttributions
                .map(attribution => ({
                    uri: attribution.web?.uri,
                    title: attribution.web?.title,
                }))
                .filter(source => source.uri && source.title);
        }

        // Renvoie 'text' et 'sources' comme attendu par le client
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", 
            },
            body: JSON.stringify({ text: resultText, sources: sources })
        };

    } catch (error) {
        console.error("Erreur Gemini:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Erreur lors de la communication avec l'API Gemini: ${error.message}` })
        };
    }
}

// 3. Correction : Exportation de la fonction en mode CJS à la fin du fichier
exports.handler = handler;
