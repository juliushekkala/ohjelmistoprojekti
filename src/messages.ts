import * as vscode from 'vscode';

//defining outChannel for the module
const outChannel = vscode.window.createOutputChannel('openAPI yaml tester');

export function start() {
    //Start outputChannel and show it for the user
	outChannel.appendLine('This is the output window for the extension');
	outChannel.show(true);
}


export function time() {
    //Print starting time
    let currentTime = new Date();
    outChannel.appendLine('Starting tests at:');
    //adding leading zero and slicing to get 2 last digits from all...
    outChannel.appendLine(("0" + currentTime.getHours()).slice(-2) + ":" +
        ("0" +currentTime.getMinutes()).slice(-2) + ":" + 
        ("0" +currentTime.getSeconds()).slice(-2));
}

export function file(currentlyOpenTabfilePath: string) {
    //Print file name
    outChannel.appendLine('Testing file:');
    outChannel.appendLine(currentlyOpenTabfilePath);
}

export function yaml(currentlyOpenTabfilePath: string) {
    //Tell whether the file is yaml or not
    if (currentlyOpenTabfilePath.endsWith("yaml")) {
        vscode.window.showInformationMessage(currentlyOpenTabfilePath);
        outChannel.appendLine('File is yaml, OK!');
    }
    else {
       outChannel.appendLine('File is not yaml, cannot test this!');
    }
}


export function test(servers_here: { [index: string]: any; }) {
    //Iterate through the results and show them to the user. 
		let numberoftests = 0;
		for (let key in servers_here) {
			let value = servers_here[key];
			numberoftests++;

      let teststart = "";
    let exploit = "";
    let flawcause = "";
    let allgood = "";
    if (key === "addr_list"){
        teststart = "Checking if there are http-addresses instead of https:";
        exploit = "By not having a https server the api is vulnerable for wifi attacks";
        flawcause = " -> is not https!";
        allgood = "Urls seem to be ok, thats good!";}
    else if (key === "sec_schemes"){				
            teststart = "Checking sec schemes:";
        exploit = "Scheme exploit possible";
        flawcause = " -> this is wrong";
        allgood = "Security schemes seem to be ok";}
    else {				
        teststart = "Starting a test, which I don't yet know";
        exploit = "Scheme exploit possible, don't know the exploit";
        flawcause = " -> this is wrong, don't know what it is";
        allgood = "Test was ok, don't know what was tested";}
    //time to print them out
    outChannel.appendLine("Test" + numberoftests + ": " + teststart);
    //printing only if the status bit is false
    if (value["status"] === false){
        for (let flaw in value) {
        //dont want to print the status again though
            if (flaw === "status") {continue;}
            if (value[flaw] === false) {
                outChannel.appendLine(flaw + flawcause);
            }
        }
        outChannel.appendLine(exploit);
    }   
    else {outChannel.appendLine(allgood);}
    
    //The current test has now finished, starting new test (start of the loop)
}


//Yaml file testing ended, give results
outChannel.appendLine("Tested " + numberoftests + " test modules");

}