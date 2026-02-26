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
<<<<<<< HEAD
            ErrorPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside, true);
=======
            ErrorPanel.currentPanel._panel.reveal();
>>>>>>> main
        } else {
            const panel = vscode.window.createWebviewPanel(
                'errorExplainer',
                '🤖 AI Error Explainer',
<<<<<<< HEAD
                { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
=======
                vscode.ViewColumn.Beside,
>>>>>>> main
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
<<<<<<< HEAD
        this._panel.webview.onDidReceiveMessage((message) => {
            if (message.command === 'dismiss') {
                ErrorPanel.currentPanel?._panel.dispose();
                ErrorPanel.currentPanel = undefined;
            }
        });
=======
>>>>>>> main
    }

    private _update(
        error: string,
        file: string,
        line: number,
        explanation: string
    ) {
<<<<<<< HEAD
        const fileName = file.split('\\').pop() ||
=======
        const fileName = file.split('\\\\').pop() ||
>>>>>>> main
                        file.split('/').pop() || file;

        this._panel.webview.html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
<<<<<<< HEAD
            padding: 15px;
            background: #1e1e1e;
            color: #d4d4d4;
            overflow-y: auto;
=======
            padding: 20px;
            background: #1e1e1e;
            color: #d4d4d4;
>>>>>>> main
        }
        .error-box {
            background: #3d1515;
            border-left: 4px solid #f44747;
<<<<<<< HEAD
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
=======
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
>>>>>>> main
        }
        .ai-box {
            background: #1d3a2f;
            border-left: 4px solid #4ec9b0;
<<<<<<< HEAD
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .ai-title {
            color: #4ec9b0;
            font-size: 14px;
=======
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .ai-title {
            color: #4ec9b0;
            font-size: 16px;
>>>>>>> main
            font-weight: bold;
            margin-bottom: 8px;
        }
        .explanation {
            line-height: 1.6;
<<<<<<< HEAD
            font-size: 13px;
            word-wrap: break-word;
=======
            font-size: 14px;
>>>>>>> main
        }
        .btn {
            background: #3a3a3a;
            color: white;
            border: none;
<<<<<<< HEAD
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
=======
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
>>>>>>> main
        }
        .btn:hover { background: #4a4a4a; }
    </style>
</head>
<body>
    <div class="error-box">
        <div class="error-title">🔴 Error Detected</div>
<<<<<<< HEAD
        <div class="error-location">📄 ${fileName} — Line ${line}</div>
        <div>${error}</div>
=======
        <div class="error-location">
            📄 ${fileName} — Line ${line}
        </div>
        <div style="margin-top: 10px; font-size: 13px;">
            ${error}
        </div>
>>>>>>> main
    </div>

    <div class="ai-box">
        <div class="ai-title">🤖 AI Explanation</div>
        <div class="explanation">${explanation}</div>
    </div>

<<<<<<< HEAD
    <button class="btn" onclick="dismiss()">✖ Dismiss</button>
=======
    <button class="btn" onclick="dismiss()">
        ✖ Dismiss
    </button>
>>>>>>> main

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