// proxygemini/functions/index.mjs
import { GoogleGenAI } from "@google/genai";

// Clé API
const apiKey = process.env.GEMINI_API_KEY;

// Crée une instance du client Gemini
const ai = new GoogleGenAI({apiKey});

// La logique est désormais exportée dans une fonction handler, résolvant l'erreur Top-level return
export async function handler(event, context) {

    // Vérification de l'absence de clé API
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY is missing." })
        };
    }

    // Le corps de la requête est requis
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing request body" })
        };
    }

    let data;
    try {
        data = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid JSON format" })
        };
    }

    const prompt = data.prompt;

    // Vérification de l'absence de prompt
    if (!prompt) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing prompt" })
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "Tu es un assistant IA pédagogique et bienveillant, spécialement conçu pour donner des définitions simples et adaptées aux enfants en français. Tu réponds uniquement avec le contenu demandé par l'utilisateur.",
                temperature: 0.4
            }
        });

        // La réponse brute de l'IA
        const result = response.text;

        // Réponse HTTP finale
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Autoriser toutes les origines pour le proxy Netlify
            },
            body: JSON.stringify({ result: result })
        };

    } catch (error) {
        console.error("Erreur Gemini:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erreur lors de la communication avec l'API Gemini." })
        };
    }
}
