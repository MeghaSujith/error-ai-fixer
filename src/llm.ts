<<<<<<< HEAD
=======
import Groq from 'groq-sdk';
>>>>>>> main
import * as vscode from 'vscode';
import * as https from 'https';

export async function getAIExplanation(
    errorMessage: string,
    fileName: string,
    lineNumber: number
): Promise<string> {

    const config = vscode.workspace.getConfiguration('errorAiFixer');
    const apiKey = config.get<string>('openaiApiKey') || '';
    const body = JSON.stringify({
        "model": "llama-3.3-70b-versatile",
        messages: [
            {
                role: 'system',
                content: 'You are an AI assistant inside VS Code. Explain coding errors to beginners in simple language. Keep it under 5 sentences.'
            },
            {
                role: 'user',
                content: `Error: ${errorMessage} File: ${fileName} Line: ${lineNumber}. Explain this simply.`
            }
        ],
        max_tokens: 150
    });

<<<<<<< HEAD
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res: any) => {
            let data = '';
            res.on('data', (chunk: any) => { data += chunk; });
            res.on('end', () => {
                console.log('Raw response:', data);
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices && parsed.choices[0]) {
                        resolve(parsed.choices[0].message.content);
                    } else if (parsed.error) {
                        resolve(`⚠️ API Error: ${parsed.error.message}`);
                    } else {
                        resolve("⚠️ Unexpected response format.");
                    }
                } catch (e) {
                    resolve("⚠️ Couldn't parse AI response.");
                }
            });
        });

        req.on('error', (error: any) => {
            console.error('Request error:', error);
            resolve("⚠️ Couldn't connect to AI.");
        });
=======
    if (!apiKey) {
        vscode.window.showErrorMessage(
            '⚠️ No API key found. Go to Settings and search for AI Error Fixer to add your key.'
        );
        return "No API key configured.";
    }

    const client = new Groq({ apiKey });

    const systemPrompt = `You are an AI assistant integrated into VS Code. 
Your job is to explain coding errors to beginner developers in simple friendly language. 
When given an error message, a file name, and a line number, explain:
1. What the error means in plain English
2. Why it likely happened  
3. How to fix it with a short code example
Keep explanations under 5 sentences. Avoid technical jargon.`;

    const userPrompt = `Error: ${errorMessage}
File: ${fileName}
Line: ${lineNumber}
Please explain this error simply.`;

    try {
        const response = await client.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 150
        });

        return response.choices[0].message.content ||
               "Sorry, I couldn't generate an explanation.";
>>>>>>> main

        req.write(body);
        req.end();
    });
}