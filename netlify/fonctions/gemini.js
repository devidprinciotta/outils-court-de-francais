// netlify/functions/gemini.js

const fetch = require('node-fetch'); 
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

exports.handler = async (event) => {
    // 1. Vérification de la méthode
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    // 2. Récupération sécurisée de la clé API
    // Cette variable est celle que vous avez définie dans les variables d'environnement de Netlify.
    const API_KEY = process.env.GEMINI_API_KEY; 
    
    if (!API_KEY || API_KEY.trim() === "") {
        console.error("Erreur: Clé API Gemini manquante dans les variables d'environnement.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erreur Critique : La clé API est absente du serveur. La fonctionnalité IA est désactivée." }),
        };
    }

    // 3. Récupération du payload du client
    let clientPayload;
    try {
        clientPayload = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: 'Invalid JSON payload' };
    }
    
    try {
        // 4. Appel à l'API Gemini avec la clé côté serveur
        const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientPayload) 
        });

        const data = await response.json();

        if (!response.ok) {
             console.error(`Erreur externe Gemini (${response.status}):`, data);
             // Renvoie l'erreur pour qu'elle soit gérée par le code client
             return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Erreur de l'API Gemini. Statut: ${response.status}`, details: data }),
            };
        }

        // 5. Renvoyer la réponse de l'IA au client
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("Erreur d'exécution de la fonction Netlify:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erreur interne du serveur lors de l\'appel à l\'IA.' }),
        };
    }
};
