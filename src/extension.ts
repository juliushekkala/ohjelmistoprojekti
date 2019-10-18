// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as readapi from "./readapi";

const yaml = require('js-yaml');
const fs   = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showWarningMessage('Hello VS Code!');

		//Display time to user
		let currentTime = new Date();
		vscode.window.showInformationMessage(currentTime.toString());
		var currentlyOpenTabfilePath = "hello.txt";
		//from https://stackoverflow.com/a/42637468 
		//Get the path of the currently open file
		if (typeof vscode.window.activeTextEditor  !== 'undefined') {
			currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
		}
		//Check that it is yaml 
		if (currentlyOpenTabfilePath.endsWith("yaml")) {
			vscode.window.showInformationMessage(currentlyOpenTabfilePath);
		}
		
		//Load the yaml 
		
		try {
			var ymlfile = yaml.safeLoad(fs.readFileSync(currentlyOpenTabfilePath, 'utf8'));
		} catch (e) {
			vscode.window.showInformationMessage("failure :D");
		}
		
		//Check whether the server supports HTTP
		var servers_here = readapi.checkHTTP(ymlfile);
		//Iterate through the results and show them to the user. 
		for (let key in servers_here) {
			let value = servers_here[key];
			vscode.window.showInformationMessage(key + "," + value);
		}

		//Starting the output channel
		const outputChannel = vscode.window.createOutputChannel('OpenAPI yaml tester');
		outputChannel.appendLine('This is the output window for the extension');
		outputChannel.show(true);
		//Testing some printing
		let test1_name = 'http test';
		let test_number = '0';
		setTimeout(() => { 
			outputChannel.appendLine('Running test:');
			outputChannel.appendLine(test_number);
			outputChannel.appendLine(test1_name);
		}, 500);
			
		
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
