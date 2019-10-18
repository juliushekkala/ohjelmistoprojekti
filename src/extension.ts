// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as readapi from "./readapi";

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

		// Display a message box to the user
		vscode.window.showWarningMessage('Starting openAPI yaml tester');

		//Starting the output channel and showing it to the user
		const print = vscode.window.createOutputChannel('openAPI yaml tester');
		print.appendLine('This is the output window for the extension');
		print.show(true);

		//Find current time
		let currentTime = new Date();
		//Display time to user
		//vscode.window.showInformationMessage(currentTime.toString());
		//Print time to user (Itä-Euroopan kesäaika??)
		print.appendLine('Starting tests at:');
		print.appendLine(currentTime.toString());

		var currentlyOpenTabfilePath = "hello.txt";
		//from https://stackoverflow.com/a/42637468 
		//Get the path of the currently open file
		if (typeof vscode.window.activeTextEditor !== 'undefined') {
			currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
		}

		//Print file name
		print.appendLine('Testing file:');
		print.appendLine(currentlyOpenTabfilePath);

		//Check that file to be tested is yaml 
		if (currentlyOpenTabfilePath.endsWith("yaml")) {
			vscode.window.showInformationMessage(currentlyOpenTabfilePath);
			print.appendLine('File is yaml, OK!');
		}
		else {
			print.appendLine('Not yaml!');
		}

		//Load the yaml 
		try {
			var ymlfile = yaml.safeLoad(fs.readFileSync(currentlyOpenTabfilePath, 'utf8'));
		} catch (e) {
			vscode.window.showInformationMessage("failure :D");
		}

		//Check whether the server supports HTTP
		var servers_here = readapi.checkHTTP(ymlfile);

		//Print the name of the test function
		print.appendLine('Checking if the urls contain http:// addresses');
		let numberoftests = 0;

		//Iterate through the results and show them to the user. 
		for (let key in servers_here) {
			let value = servers_here[key];
			//vscode.window.showInformationMessage(key + "," + value);
			
			//Print them to output
			print.appendLine(key.concat(" ", value));
		}

		//HTTP testing ended, give number of addresses found
		let textfiller = "Found ";
		print.appendLine(textfiller.concat(numberoftests.toString()));

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
