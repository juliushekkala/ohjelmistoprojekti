import * as vscode from 'vscode';

//defining outChannel for the module
const outChannel = vscode.window.createOutputChannel('openAPI yaml tester');

//total number of tests, all modules, starts from zero (maybe needs var?)
//different names for functions, so those can be returned if needed somewhere else
let totaltests = 0;
let securitytests = 0;

export function reset() {
    totaltests = 0;
    securitytests = 0;
    }

//sets up output window for all other modules, clears it and shows it automatically
export function start() {
    outChannel.clear();
    outChannel.appendLine('This is the output window for the extension');
	outChannel.show(true);
}

//prints time and the reason text
export function time(reason: string) {
    let currentTime = new Date();
    outChannel.appendLine(reason);
    
    //adding leading zero and slicing to get 2 last digits from all...
    outChannel.appendLine(
        ("0" + currentTime.getHours()).slice(-2) + ":" +
        ("0" + currentTime.getMinutes()).slice(-2) + ":" + 
        ("0" + currentTime.getSeconds()).slice(-2));
}

//prints file name
export function file(currentlyOpenTabfilePath: string) {
    outChannel.appendLine('Testing file:');
    outChannel.appendLine(currentlyOpenTabfilePath);
}
//tells whether the file is yaml or not
export function yaml(currentlyOpenTabfilePath: string) {
    if (currentlyOpenTabfilePath.endsWith("yaml")) {
        vscode.window.showInformationMessage(currentlyOpenTabfilePath);
        outChannel.appendLine('File is yaml, OK!');
    }
    else {
       outChannel.appendLine('File is not yaml, cannot test this!');
    }
}

//prints the results from the readapi tests
export function security(servers_here: { [index: string]: any; }) {
    //Iterate through the results of the readapi tests (security)
	for (let key in servers_here) {
        let value = servers_here[key];
        //Increase the number of the test, so the total and current can be printed
        securitytests++;
    
        //Need to declare the strings to be used first
        let teststart = "";
        let exploit = "";
        let flawcause = "";
        let allgood = "";
    
        //Change the strings according to the test name
        switch (key) {
        
            //addr_list
            case "addr_list" :
                teststart = "Checking if there are http-addresses instead of https:";
                exploit = "By not having a https server the api is vulnerable for wifi attacks";
                flawcause = " -> is not https!";
                allgood = "Urls seem to be ok, thats good!";
                break;
            
            //sec_schemes
            case "sec_schemes" :				
                teststart = "Checking sec schemes:";
                exploit = "Scheme exploit possible";
                flawcause = " -> this is wrong";
                allgood = "Security schemes seem to be ok";
                break;
        
            //data valid
            case "sec_field" :				
                teststart = "Checking whether global security field exists and it is not empty:";
                exploit = "Global security field not defined or is empty";
                flawcause = "Undefined or empty";
                allgood = "Global security field exists and is not empty";
                break;
        



            //unknown test
            default :				
                teststart = "Starting a test, which I don't yet know";
                exploit = "Scheme exploit possible, don't know the exploit";
                flawcause = " -> this is wrong, don't know what it is";
                allgood = "Test was ok, don't know what was tested";
                break;
        }
    
        //Print the current test number
        outChannel.appendLine("Test" + securitytests + ": " + teststart);
    
        //printing the results only if the status bit of that value is false == error
        if (value["status"] === false){
            for (let flaw in value) {
            //dont want to print the status row again though, so lets ignore that:
                if (flaw === "status") {
                continue;
                }
            //but for other errors, print the flaw and the cause
                if (value[flaw] === false) {
                    outChannel.appendLine(flaw + flawcause);
                }
            }
            //Print the possible exploit for these flaws
            outChannel.appendLine(exploit);
        }   

        //Otherwise, if no errors found, just print that the test was successful
        else {
            outChannel.appendLine(allgood);
        }
    
        //The current test portion has now finished, starting new test (back to the start of the for-loop)
    }

    //Security testing ended, give total results, this total needs to be used again in next modules
    outChannel.appendLine("Tested " + securitytests + " test modules in this function");
    totaltests =+ securitytests;
    outChannel.appendLine("Tested " + totaltests + " in all test modules");
}