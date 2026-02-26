import * as vscode from 'vscode';
import { startErrorDetection } from './errorDetector';
import { getAIExplanation } from './llm';
import { ErrorPanel } from './webview';

const SUPPORTED_LANGUAGES = [
    'typescript',
    'javascript',
    'python',
    'c',
    'cpp',
    'java'
];

function getLanguageFromUri(uri: vscode.Uri): string {
    const path = uri.fsPath.toLowerCase();
    if (path.endsWith('.ts') || path.endsWith('.tsx')) { return 'typescript'; }
    if (path.endsWith('.js') || path.endsWith('.jsx')) { return 'javascript'; }
    if (path.endsWith('.py'))                           { return 'python'; }
    if (path.endsWith('.c'))                            { return 'c'; }
    if (path.endsWith('.cpp') || path.endsWith('.cc') || path.endsWith('.cxx')) { return 'cpp'; }
    if (path.endsWith('.h') || path.endsWith('.hpp'))   { return 'cpp'; }
    if (path.endsWith('.java'))                         { return 'java'; }
    return 'unknown';
}

export function activate(context: vscode.ExtensionContext) {

    console.log('🚀 AI Error Fixer Phase 2 is now active!');

    const helloCommand = vscode.commands.registerCommand(
        'error-ai-fixer.helloWorld',
        () => {
            vscode.window.showInformationMessage(
                'Hello from AI Error Fixer Phase 2!'
            );
        }
    );

    const demoCommand = vscode.commands.registerCommand(
        'error-ai-fixer.triggerDemo',
        async () => {
            const explanation = await getAIExplanation(
                "Type 'string' is not assignable to type 'number'.",
                'demo-file.ts',
                7
            );
            ErrorPanel.show(
                "Type 'string' is not assignable to type 'number'.",
                'demo-file.ts',
                7,
                explanation
            );
        }
    );

    startErrorDetection(context);

    let isProcessing = false;

    const errorListener = vscode.languages.onDidChangeDiagnostics(
        async (event) => {
            if (isProcessing) { return; }
            isProcessing = true;

            for (const uri of event.uris) {
                // ✅ FIX: Check language before processing — this is what was
                // missing before, causing C files to be ignored or mishandled
                const document = vscode.workspace.textDocuments.find(
                    doc => doc.uri.toString() === uri.toString()
                );
                const languageId = document?.languageId || getLanguageFromUri(uri);

                if (!SUPPORTED_LANGUAGES.includes(languageId)) {
                    continue;
                }

                const diagnostics = vscode.languages.getDiagnostics(uri);
                for (const diag of diagnostics) {
                    if (diag.severity === vscode.DiagnosticSeverity.Error ||
    diag.severity === vscode.DiagnosticSeverity.Warning) {
                        const explanation = await getAIExplanation(
                            diag.message,
                            uri.fsPath,
                            diag.range.start.line + 1
                        );
                        ErrorPanel.show(
                            diag.message,
                            uri.fsPath,
                            diag.range.start.line + 1,
                            explanation
                        );
                        isProcessing = false;
                        return;
                    }
                }
            }
            isProcessing = false;
        }
    );

    context.subscriptions.push(
        helloCommand,
        demoCommand,
        errorListener
    );
}

export function deactivate() {}