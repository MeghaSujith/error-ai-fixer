import * as vscode from 'vscode';

const SUPPORTED_LANGUAGES = [
    'typescript',
    'javascript',
    'python',
    'c',
    'cpp',
    'java'
];

export function startErrorDetection(context: vscode.ExtensionContext) {
    console.log('✅ Error detector is now active and listening...');
    console.log('✅ Supported languages:', SUPPORTED_LANGUAGES.join(', '));

    const disposable = vscode.languages.onDidChangeDiagnostics((event) => {
        event.uris.forEach(async (uri) => {

            const document = vscode.workspace.textDocuments.find(
                doc => doc.uri.toString() === uri.toString()
            );

            if (document && !SUPPORTED_LANGUAGES.includes(document.languageId)) {
                console.log(`⏭️ Skipping unsupported language: ${document.languageId}`);
                return;
            }

            const diagnostics = vscode.languages.getDiagnostics(uri);

            diagnostics.forEach((diag) => {
                if (diag.severity === vscode.DiagnosticSeverity.Error) {
                    const errorInfo = {
                        message: diag.message,
                        file: uri.fsPath,
                        line: diag.range.start.line + 1,
                        language: document?.languageId || 'unknown'
                    };
                    console.log('🔴 ERROR DETECTED:');
                    console.log('   Message  :', errorInfo.message);
                    console.log('   File     :', errorInfo.file);
                    console.log('   Line     :', errorInfo.line);
                    console.log('   Language :', errorInfo.language);
                    console.log('----------------------------');
                }
            });
        });
    });

    context.subscriptions.push(disposable);
}
