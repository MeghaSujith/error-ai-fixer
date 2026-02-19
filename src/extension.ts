import * as vscode from 'vscode';
import { startErrorDetection } from './errorDetector';
import { showErrorPopup } from './popup';

export function activate(context: vscode.ExtensionContext) {

    console.log('🚀 AI Error Fixer extension is now active!');

    // Original hello world command
    const helloCommand = vscode.commands.registerCommand(
        'error-ai-fixer.helloWorld',
        () => {
            vscode.window.showInformationMessage('Hello World from AI Error Fixer!');
        }
    );

    // Demo command — triggers a fake error popup for the presentation
    const demoCommand = vscode.commands.registerCommand(
        'error-ai-fixer.triggerDemo',
        () => {
            showErrorPopup(
                "Type 'string' is not assignable to type 'number'.",
                'demo-file.ts',
                7
            );
        }
    );

    // Start Jovita's real error detector (logs to Debug Console)
    startErrorDetection(context);

    // Connect real errors to Jesna's popup
    const errorListener = vscode.languages.onDidChangeDiagnostics((event) => {
        event.uris.forEach((uri) => {
            const diagnostics = vscode.languages.getDiagnostics(uri);
            diagnostics.forEach((diag) => {
                if (diag.severity === vscode.DiagnosticSeverity.Error) {
                    showErrorPopup(
                        diag.message,
                        uri.fsPath,
                        diag.range.start.line + 1
                    );
                }
            });
        });
    });

    context.subscriptions.push(helloCommand, demoCommand, errorListener);
}

export function deactivate() {}