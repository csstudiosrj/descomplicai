// lib/gemini.js
// Cliente para a API do Google Gemini (gratuita via AI Studio)
// Dependências: fetch nativo do Node.js

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent';

/**
 * Chama a API do Gemini com um prompt
 * @param {string} prompt - Texto do prompt
 * @param {number} maxTokens - Máximo de tokens na resposta (default: 4000)
 * @returns {Promise<string>} - Texto gerado
 */
export async function gerarTextoGemini(prompt, maxTokens = 4000) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada nas variáveis de ambiente');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
        topP: 0.95,
      }
    })
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(`Gemini API erro: ${erro.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!texto) {
    throw new Error('Gemini API não retornou texto');
  }

  return texto;
}