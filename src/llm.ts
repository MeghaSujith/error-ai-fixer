import Groq from 'groq-sdk';
import * as vscode from 'vscode';

export async function getAIExplanation(
    errorMessage: string,
    fileName: string,
    lineNumber: number
): Promise<string> {

    const config = vscode.workspace.getConfiguration('errorAiFixer');
    const apiKey = config.get<string>('openaiApiKey');

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

    } catch (error) {
        return "⚠️ Couldn't connect to AI. Check your API key and internet connection.";
    }
}