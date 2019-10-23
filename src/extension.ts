// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as readapi from "./readapi";
import { isNull } from 'util';

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

		//Starting the output channel and showing it to the user
		//defining outChannel for the out() function
		const outChannel = vscode.window.createOutputChannel('openAPI yaml tester');
		
		//out() print function (move to other .ts?, allow more than 4?)
		function out(first?: any, second?: any, third?: any, fourth?: any) {
		if (fourth)	{
			outChannel.appendLine(`${first}${second}${third}${fourth}`);
		}
		else if (third) {
			outChannel.appendLine(`${first}${second}${third}`);
		} 
		else if (second){
			outChannel.appendLine(`${first}${second}`);
		}		
		else {
			outChannel.appendLine(`${first}`);
		}
		}

		// Create a connection for the server. The connection uses 
		// stdin / stdout for message passing
		out('This is the output window for the extension');
		outChannel.show(true);

		//Find current time
		let currentTime = new Date();
		out('Starting tests at:');
		out(currentTime.getHours() + ":", currentTime.getMinutes() + ":", currentTime.getSeconds());

		var currentlyOpenTabfilePath = "hello.txt";
		//from https://stackoverflow.com/a/42637468 
		//Get the path of the currently open file
		if (typeof vscode.window.activeTextEditor !== 'undefined') {
			currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
		}

		//Print file name
		out('Testing file:');
		out(currentlyOpenTabfilePath);

		//Check that file to be tested is yaml 
		if (currentlyOpenTabfilePath.endsWith("yaml")) {
			vscode.window.showInformationMessage(currentlyOpenTabfilePath);
			out('File is yaml, OK!');
		}
		else {
			out('Not yaml!');
		}

		//Load the yaml 
		try {
			var ymlfile = yaml.safeLoad(fs.readFileSync(currentlyOpenTabfilePath, 'utf8'));
		} catch (e) {
			vscode.window.showInformationMessage("failure :D");
		}
		
		//Check whether the server supports HTTP
		let Apicheck = new readapi.Apicheck(ymlfile);
		var servers_here = Apicheck.checkSecurity(ymlfile);

		//Print the name of the test function
		out('Checking if the urls contain http:// addresses');
		let numberoftests = 0;
		let numberofthistest = 0;
		//Iterate through the results and show them to the user. 
		for (let key in servers_here) {
			let value = servers_here[key];
			numberoftests++;
			numberofthistest++;	
			//Print them to output
			out("Testi nro" + numberofthistest, key, value);
		}

		//HTTP testing ended, give number of addresses found
		out("Found ", numberoftests.toString(), " errors");

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
