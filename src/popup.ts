import * as vscode from 'vscode';

export async function showErrorPopup(
    message: string,
    file: string,
    line: number
) {
    const fileName = file.split('\\\\').pop() || file.split('/').pop() || file;

    const selection = await vscode.window.showErrorMessage(
        `🔴 Error detected on line ${line} in ${fileName}`,
        { modal: false },
        'Explain This Error',
        'Ignore'
    );

    if (selection === 'Explain This Error') {
        showExplanationPopup(message);
    } else if (selection === 'Ignore') {
        vscode.window.showInformationMessage(
            '✅ Error dismissed. You can revisit it anytime.'
        );
    }
}

function showExplanationPopup(errorMessage: string) {
    const explanation = getMockExplanation(errorMessage);
    vscode.window.showInformationMessage(
        `🤖 AI Explanation: ${explanation}`,
        'Got it!'
    );
}

function getMockExplanation(error: string): string {
    const lowerError = error.toLowerCase();

    if (lowerError.includes('not assignable') || lowerError.includes('type')) {
        return "You're giving a variable the wrong type of value — for example, putting text where a number is expected. Check the variable type and make sure the value matches.";
    }

    if (lowerError.includes('cannot find name') || lowerError.includes('not defined')) {
        return "This variable or function doesn't exist yet in this scope. Make sure you declared it before using it.";
    }

    if (lowerError.includes('return')) {
        return "Your function is supposed to return a value but isn't always doing so. Add a return statement at the end.";
    }

    return "There's a code error that needs fixing. Double-check your syntax and variable types on the highlighted line.";
}