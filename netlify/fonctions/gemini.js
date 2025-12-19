// netlify/functions/gemini.js
const fetch = require('node-fetch');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

exports.handler = async (event) => {
    // 1. Vérification de la méthode
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    // 2. Récupération sécurisée de la clé API
    const API_KEY = process.env.GEMINI_API_KEY; 
    
    if (!API_KEY || API_KEY.trim() === "") {
        console.error("Erreur: Clé API Gemini manquante.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Clé API absente du serveur." }),
        };
    }

    // 3. Récupération du mot du client
    let clientData;
    try {
        clientData = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: 'Invalid JSON payload' };
    }
    
    const wordToSearch = clientData.word;
    if (!wordToSearch || wordToSearch.trim() === "") {
        return { statusCode: 400, body: JSON.stringify({ error: "Aucun mot fourni." }) };
    }

    // 4. RECONSTRUCTION du payload Gemini (identique à ton front-end)
    const systemPrompt = "Vous êtes un tuteur de vocabulaire pour enfants et un expert en langue française. Fournissez une courte définition simple et un exemple d'utilisation du mot demandé. Formatez la réponse avec 'Définition: [votre définition]\\nExemple: [votre exemple]'. La réponse doit être en français. Ne proposez aucun autre dialogue ou texte que la définition et l'exemple.";
    const userQuery = `Donnez une définition et un exemple pour le mot : ${wordToSearch}`;

    const geminiPayload = {
        contents: [{ parts: [{ text: userQuery }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
        // 5. Appel à l'API Gemini avec la clé côté serveur
        const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload) 
        });

        const data = await response.json();

        if (!response.ok) {
             console.error(`Erreur Gemini (${response.status}):`, data);
             return {
                statusCode: response.status,
                body: JSON.stringify({ 
                    error: `Erreur de l'API Gemini.`, 
                    details: data 
                }),
            };
        }

        // 6. Renvoyer la réponse au client
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("Erreur d'exécution:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur interne du serveur.' }),
        };
    }
};
