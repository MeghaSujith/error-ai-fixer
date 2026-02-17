import OpenAI from 'openai';
import * as vscode from 'vscode';

export async function getAIExplanation(
    errorMessage: string,
    fileName: string,
    lineNumber: number
): Promise<string> {

    const config = vscode.workspace.getConfiguration('errorAiFixer');
    const apiKey = config.get<string>('openaiApiKey');

    if (!apiKey) {
        return "⚠️ No API key found. Please add your OpenAI API key in VS Code settings.";
    }

    const client = new OpenAI({ apiKey });

    const systemPrompt = `You are an AI assistant integrated into VS Code. 
Your job is to explain coding errors to beginner developers in simple, friendly language. 
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
            model: 'gpt-3.5-turbo',
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