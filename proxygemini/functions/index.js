// Test temporaire pour vérifier que Netlify renvoie du JSON

exports.handler = async (event, context) => {
    // Vérification de la présence du corps (qui était la dernière erreur avant le plantage)
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ text: "Erreur client: Pas de corps de requête.", sources: [] })
        };
    }
    
    // Si le corps est présent, renvoie une réponse JSON valide 200 OK
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", 
        },
        body: JSON.stringify({ 
            text: "TEST OK: La fonction Netlify s'exécute correctement et renvoie du JSON.", 
            sources: [] 
        })
    };
};
