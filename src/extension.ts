import * as vscode from 'vscode';
import * as cp from 'child_process';
import { startErrorDetection } from './errorDetector';
import { getAIExplanation } from './llm';
import { ErrorPanel } from './webview';

// ✅ Play Windows system error sound silently in background
function playSystemSound() {
    try {
        cp.exec('powershell -Command "[System.Media.SystemSounds]::Exclamation.Play()"');
    } catch (e) {
        // silently fail if not on Windows
    }
}

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

function isJavaNonProjectFile(uri: vscode.Uri): boolean {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) { return true; }
    const filePath = uri.fsPath.replace(/\\/g, '/');
    return !filePath.includes('/src/');
}

function hasTypeCheck(document: vscode.TextDocument): boolean {
    const firstLine = document.lineAt(0).text;
    return firstLine.includes('@ts-check');
}

function showJavaSetupGuide() {
    const panel = vscode.window.createWebviewPanel(
        'javaSetupGuide',
        '☕ Java Setup Guide',
        { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
        {}
    );
    panel.webview.html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
        h2 { color: #f0a500; }
        .step { background: #2d2d2d; border-left: 4px solid #f0a500; padding: 10px 14px; margin-bottom: 10px; border-radius: 4px; font-size: 13px; line-height: 1.6; }
        .note { background: #1d3a2f; border-left: 4px solid #4ec9b0; padding: 10px 14px; border-radius: 4px; font-size: 12px; margin-top: 15px; }
    </style>
</head>
<body>
    <h2>☕ Java Project Setup</h2>
    <p style="color:#888; font-size:12px;">Your Java file is outside a project folder. Only syntax errors are detected.</p>
    <div class="step">1️⃣ Create a new folder on your Desktop — e.g. <strong>java-project</strong></div>
    <div class="step">2️⃣ Inside it, create a subfolder called <strong>src</strong></div>
    <div class="step">3️⃣ Move your <strong>.java</strong> file into the <strong>src</strong> folder</div>
    <div class="step">4️⃣ In VS Code → <strong>File → Open Folder</strong> → select <strong>java-project</strong></div>
    <div class="step">5️⃣ Open your file from the Explorer panel and start coding!</div>
    <div class="note">💡 Java needs a project structure to fully analyze type errors like <code>int x = "hello"</code>.</div>
</body>
</html>`;
}

function showJsTypeCheckGuide() {
    const panel = vscode.window.createWebviewPanel(
        'jsTypeCheckGuide',
        '📝 JavaScript Better Errors',
        { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
        {}
    );
    panel.webview.html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
        h2 { color: #f7df1e; }
        .step { background: #2d2d2d; border-left: 4px solid #f7df1e; padding: 10px 14px; margin-bottom: 10px; border-radius: 4px; font-size: 13px; line-height: 1.6; }
        .code { background: #0d0d0d; color: #f7df1e; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 13px; margin: 8px 0; }
        .note { background: #1d3a2f; border-left: 4px solid #4ec9b0; padding: 10px 14px; border-radius: 4px; font-size: 12px; margin-top: 15px; }
    </style>
</head>
<body>
    <h2>📝 Enable Better JS Error Detection</h2>
    <p style="color:#888; font-size:12px;">By default, JavaScript doesn't detect undeclared variables or type errors.</p>
    <div class="step">1️⃣ Add this line at the <strong>very top</strong> of your <strong>.js</strong> file:
        <div class="code">// @ts-check</div>
    </div>
    <div class="step">2️⃣ Save the file with <strong>Ctrl+S</strong></div>
    <div class="step">3️⃣ Now errors like undeclared variables and type mismatches will be detected!</div>
    <div class="note">💡 <code>// @ts-check</code> tells VS Code to use TypeScript's checker on your JS file.</div>
</body>
</html>`;
}

export function activate(context: vscode.ExtensionContext) {

    console.log('🚀 AI Error Fixer Phase 2 is now active!');

    const statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left, 100
    );
    statusBar.hide();

    const errorQueue: Array<{
        message: string;
        filePath: string;
        line: number;
        explanation: string;
    }> = [];

    function updateStatusBar() {
        if (errorQueue.length > 0) {
            statusBar.text = `$(error) ${errorQueue.length} error${errorQueue.length > 1 ? 's' : ''} pending — dismiss current popup to view`;
            statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            statusBar.show();
        } else {
            statusBar.hide();
        }
    }

    function showNextFromQueue() {
        if (errorQueue.length === 0) { return; }
        const next = errorQueue.shift()!;
        updateStatusBar();
        playSystemSound();
        ErrorPanel.show(next.message, next.filePath, next.line, next.explanation);
    }

    ErrorPanel.onDismiss = showNextFromQueue;

    const helloCommand = vscode.commands.registerCommand(
        'error-ai-fixer.helloWorld',
        () => {
            vscode.window.showInformationMessage('Hello from AI Error Fixer Phase 2!');
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
    let lastLine = -1;
    const shownLines = new Set<string>();

    const fileOpenListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
        shownLines.clear();
        lastLine = -1;
        errorQueue.length = 0;
        updateStatusBar();

        if (!editor) { return; }
        const uri = editor.document.uri;
        const languageId = editor.document.languageId || getLanguageFromUri(uri);

        if (languageId === 'java' && isJavaNonProjectFile(uri)) {
            vscode.window.showWarningMessage(
                '⚠️ Java file outside project — only syntax errors detected.',
                'Show Setup Guide'
            ).then((selection) => {
                if (selection === 'Show Setup Guide') { showJavaSetupGuide(); }
            });
        }

        if (languageId === 'javascript' && !hasTypeCheck(editor.document)) {
            vscode.window.showWarningMessage(
                '⚠️ JS file missing @ts-check — limited error detection.',
                'Show Me How'
            ).then((selection) => {
                if (selection === 'Show Me How') { showJsTypeCheckGuide(); }
            });
        }
    });

    const cursorListener = vscode.window.onDidChangeTextEditorSelection(
        async (event) => {
            const editor = event.textEditor;
            const currentLine = editor.selection.active.line;

            if (currentLine === lastLine) { return; }
            lastLine = currentLine;

            if (isProcessing) { return; }

            const uri = editor.document.uri;
            const languageId = editor.document.languageId || getLanguageFromUri(uri);

            if (!SUPPORTED_LANGUAGES.includes(languageId)) { return; }

            const previousLine = currentLine - 1;
            if (previousLine < 0) { return; }

            const diagnostics = vscode.languages.getDiagnostics(uri);

            const errorOnPreviousLine = diagnostics.find(
                (diag) =>
                    diag.severity === vscode.DiagnosticSeverity.Error &&
                    diag.range.start.line === previousLine
            );

            if (errorOnPreviousLine) {
                const errorKey = `${uri.fsPath}:${previousLine}`;
                if (shownLines.has(errorKey)) { return; }
                shownLines.add(errorKey);

                isProcessing = true;
                const explanation = await getAIExplanation(
                    errorOnPreviousLine.message,
                    uri.fsPath,
                    previousLine + 1
                );
                isProcessing = false;

                if (ErrorPanel.currentPanel) {
                    errorQueue.push({
                        message: errorOnPreviousLine.message,
                        filePath: uri.fsPath,
                        line: previousLine + 1,
                        explanation
                    });
                    updateStatusBar();
                } else {
                    playSystemSound();
                    ErrorPanel.show(
                        errorOnPreviousLine.message,
                        uri.fsPath,
                        previousLine + 1,
                        explanation
                    );
                }
            }
        }
    );

    context.subscriptions.push(
        helloCommand,
        demoCommand,
        cursorListener,
        fileOpenListener,
        statusBar
    );
}

export function deactivate() {}