import * as vscode from 'vscode';

export function startErrorDetection(context: vscode.ExtensionContext) {
    console.log('✅ Error detector is now active and listening...');

    const disposable = vscode.languages.onDidChangeDiagnostics((event) => {

        event.uris.forEach((uri) => {
            const diagnostics = vscode.languages.getDiagnostics(uri);

            diagnostics.forEach((diag) => {
                if (diag.severity === vscode.DiagnosticSeverity.Error) {

                    const errorInfo = {
                        message: diag.message,
                        file: uri.fsPath,
                        line: diag.range.start.line + 1
                    };

                    console.log('🔴 ERROR DETECTED:');
                    console.log('   Message :', errorInfo.message);
                    console.log('   File    :', errorInfo.file);
                    console.log('   Line    :', errorInfo.line);
                    console.log('----------------------------');
                }
            });
        });
    });

    context.subscriptions.push(disposable);
}