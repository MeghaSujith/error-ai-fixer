import * as vscode from 'vscode';

export class ErrorPanel {
    public static currentPanel: ErrorPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;

    public static show(
        error: string,
        file: string,
        line: number,
        explanation: string
    ) {
        if (ErrorPanel.currentPanel) {
            ErrorPanel.currentPanel._update(error, file, line, explanation);
            ErrorPanel.currentPanel._panel.reveal();
        } else {
            const panel = vscode.window.createWebviewPanel(
                'errorExplainer',
                '🤖 AI Error Explainer',
                vscode.ViewColumn.Beside,
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
        });
    }

    private _update(
        error: string,
        file: string,
        line: number,
        explanation: string
    ) {
        const fileName = file.split('\\\\').pop() ||
                        file.split('/').pop() || file;

        this._panel.webview.html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #1e1e1e;
            color: #d4d4d4;
        }
        .error-box {
            background: #3d1515;
            border-left: 4px solid #f44747;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .error-title {
            color: #f44747;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .error-location {
            color: #888;
            font-size: 12px;
        }
        .ai-box {
            background: #1d3a2f;
            border-left: 4px solid #4ec9b0;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .ai-title {
            color: #4ec9b0;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .explanation {
            line-height: 1.6;
            font-size: 14px;
        }
        .btn {
            background: #3a3a3a;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .btn:hover { background: #4a4a4a; }
    </style>
</head>
<body>
    <div class="error-box">
        <div class="error-title">🔴 Error Detected</div>
        <div class="error-location">
            📄 ${fileName} — Line ${line}
        </div>
        <div style="margin-top: 10px; font-size: 13px;">
            ${error}
        </div>
    </div>

    <div class="ai-box">
        <div class="ai-title">🤖 AI Explanation</div>
        <div class="explanation">${explanation}</div>
    </div>

    <button class="btn" onclick="dismiss()">
        ✖ Dismiss
    </button>

    <script>
        const vscode = acquireVsCodeApi();
        function dismiss() {
            vscode.postMessage({ command: 'dismiss' });
        }
    </script>
</body>
</html>`;
    }
}