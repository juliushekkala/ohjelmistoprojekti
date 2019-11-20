// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as readapi from "./readapi";
import * as messages from "./messages";
import * as datavalid from "./datavalid";

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
		messages.time('Starting tests at: ');

		//var currentlyOpenTabfilePath = "hello.txt";
		var currentlyOpenTabfilePath = "";
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
			vscode.window.showInformationMessage("Can't open file");
		}
		
		//Run the security tests from readapi
		//Iterate through those results and show them to the user. 
		let Apicheck = new readapi.Apicheck(ymlfile);
		var servers_here = Apicheck.checkSecurity();
		messages.security(servers_here);
<<<<<<< HEAD
=======
		

		//Run the tests from datavalid
		let Datavalid = new datavalid.Datavalidationcheck(ymlfile);
		var validations = Datavalid.checkDataValidation();
		//Iterate through the results and show them to the user. 
		//security is not the correct one here, but for testing its close enough
		//or maybe everything can be put into same function...
		messages.security(validations);

>>>>>>> Merged branches 20112019

		//Finally, print the ending time
		messages.time('Tests ended at: ');
		//reset counters for tests run
		messages.reset();
	}
	); context.subscriptions.push(disposable);}

// this method is called when your extension is deactivated
export function deactivate() { }
