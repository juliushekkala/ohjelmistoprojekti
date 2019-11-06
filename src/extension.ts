// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as readapi from "./readapi";
import * as messages from "./messages";

const yaml = require('js-yaml');
const fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "openAPI yaml tester" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user (in the lower right corner)
		vscode.window.showWarningMessage('Starting openAPI yaml tester');

		//Start outputChannel and show it for the user
		messages.start();

		//Find current time
		messages.time();

		var currentlyOpenTabfilePath = "hello.txt";
		//from https://stackoverflow.com/a/42637468 
		//Get the path of the currently open file
		if (typeof vscode.window.activeTextEditor !== 'undefined') {
			currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
		}

		//Print file name
		messages.file(currentlyOpenTabfilePath);

		//Check that file to be tested is yaml 
		messages.yaml(currentlyOpenTabfilePath);

		//Load the yaml 
		try {
			var ymlfile = yaml.safeLoad(fs.readFileSync(currentlyOpenTabfilePath, 'utf8'));
		} catch (e) {
			vscode.window.showInformationMessage("failure :D");
		}
		
		//Check whether the server supports HTTP
		let Apicheck = new readapi.Apicheck(ymlfile);
		var servers_here = Apicheck.checkSecurity();
		messages.test(servers_here);
		//Iterate through the results and show them to the user. 
	
	}
	
); context.subscriptions.push(disposable);}

// this method is called when your extension is deactivated
export function deactivate() { }
