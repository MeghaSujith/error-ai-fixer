import * as vscode from 'vscode';

export class ErrorPanel {
    public static currentPanel: ErrorPanel | undefined;
    public static onDismiss: (() => void) | undefined;
    private readonly _panel: vscode.WebviewPanel;

    public static show(
        error: string,
        file: string,
        line: number,
        explanation: string
    ) {
        if (ErrorPanel.currentPanel) {
            ErrorPanel.currentPanel._update(error, file, line, explanation);
            ErrorPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside, true);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'errorExplainer',
                '🤖 AI Error Explainer',
                { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
                { enableScripts: true }
            );
            ErrorPanel.currentPanel = new ErrorPanel(panel);
            ErrorPanel.currentPanel._update(error, file, line, explanation);
        }
    }

    private constructor(panel: vscode.WebviewPanel) {
        this._panel = panel;
        this._panel.onDidDispose(() => {
            ErrorPanel.currentPanel = undefined;
            if (ErrorPanel.onDismiss) { ErrorPanel.onDismiss(); }
        });
        this._panel.webview.onDidReceiveMessage((message) => {
            if (message.command === 'dismiss') {
                ErrorPanel.currentPanel?._panel.dispose();
                ErrorPanel.currentPanel = undefined;
            }
        });
    }

    private _update(
        error: string,
        file: string,
        line: number,
        explanation: string
    ) {
        const fileName = file.split('\\').pop() || file.split('/').pop() || file;

        this._panel.webview.html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 15px;
            background: #1e1e1e;
            color: #d4d4d4;
            overflow-y: auto;
        }
        .error-box {
            background: #3d1515;
            border-left: 4px solid #f44747;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 15px;
            font-size: 13px;
        }
        .error-title {
            color: #f44747;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 6px;
        }
        .error-location {
            color: #888;
            font-size: 11px;
            margin-bottom: 6px;
        }
        .ai-box {
            background: #1d3a2f;
            border-left: 4px solid #4ec9b0;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .ai-title {
            color: #4ec9b0;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .explanation {
            line-height: 1.6;
            font-size: 13px;
            word-wrap: break-word;
        }
        .btn {
            background: #3a3a3a;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
        }
        .btn:hover { background: #4a4a4a; }
    </style>
</head>
<body>
    <div class="error-box">
        <div class="error-title">🔴 Error Detected</div>
        <div class="error-location">📄 ${fileName} — Line ${line}</div>
        <div>${error}</div>
    </div>

    <div class="ai-box">
        <div class="ai-title">🤖 AI Explanation</div>
        <div class="explanation">${explanation.replace(/\n/g, '<br>')}</div>
    </div>

    <button class="btn" onclick="dismiss()">✖ Dismiss</button>

    <script>
        const vscode = acquireVsCodeApi();

        // ✅ Play error beep sound when popup opens
        (function playErrorSound() {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        })();

        function dismiss() {
            vscode.postMessage({ command: 'dismiss' });
        }
    </script>
</body>
</html>`;
    }
}