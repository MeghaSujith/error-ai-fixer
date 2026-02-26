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

            // Try to find the open document, but also handle files not yet opened
            const document = vscode.workspace.textDocuments.find(
                doc => doc.uri.toString() === uri.toString()
            );

            // Detect language from file extension if document isn't open
            const languageId = document?.languageId || getLanguageFromUri(uri);

            if (!SUPPORTED_LANGUAGES.includes(languageId)) {
                console.log(`⏭️ Skipping unsupported language: ${languageId}`);
                return;
            }

            const diagnostics = vscode.languages.getDiagnostics(uri);

            diagnostics.forEach((diag) => {
                if (diag.severity === vscode.DiagnosticSeverity.Error || 
    diag.severity === vscode.DiagnosticSeverity.Warning)  {
                    const errorInfo = {
                        message: diag.message,
                        file: uri.fsPath,
                        line: diag.range.start.line + 1,
                        language: languageId
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

/**
 * Fallback: detect language from file extension when the document
 * isn't open in the editor (common with C/C++ files before cpptools loads).
 */
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