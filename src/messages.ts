import * as vscode from 'vscode';
const winston = require('winston');

//defining outChannel for the module
const outChannel = vscode.window.createOutputChannel('openAPI yaml tester');

//total number of tests, all modules, starts from zero (maybe needs var?)
//different names for functions, so those can be returned if needed somewhere else
let totalTests = 0;
let securityTests = 0;

//set the file params
//let logFileDir = loggingFolder;
let logFileDir = "C:/out";
let logFileName = "winston.txt";
let debugLogFileName = "debug.txt";

export function logFolder(loggingFolder: string | import("path").ParsedPath) {
    logFileDir = String(loggingFolder);
}

//https://stackoverflow.com/questions/55583723/creating-a-log-file-for-a-vscode-extension

//const logger: winston.Logger = winston.createLogger({
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.simple(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf((info: { timestamp: any; level: any; message: any; }) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.File({
            level: 'info',
            dirname: logFileDir,
            filename: logFileName
        }),
        new winston.transports.File({
            level: 'debug',
            dirname: logFileDir,
            filename: debugLogFileName
        })
    ]
});
    



export function reset() {
    totalTests = 0;
    securityTests = 0;
    //just some testing to be deleted later
    logger.info("whatever");
    outChannel.appendLine("LogPath: " + logFileDir + logFileName);
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
export function file(path: string) {
    outChannel.appendLine('Testing file:');
    outChannel.appendLine(path);
}

//prints folder
export function folder(folder: string) {
    outChannel.appendLine('Testing file:');
    outChannel.appendLine(folder);
}

//tells whether the file is yaml or not
export function yaml(path: string) {
    if (path.endsWith("yaml")) {
        vscode.window.showInformationMessage(path);
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
        securityTests++;
    
        //Need to declare the strings to be used first
        let testing = "";
        let exploit = "";
        let cause = "";
        let nice = "";
    
        //Change the strings according to the test name
        switch (key) {
        
            //addr_list
            case "addr_list" :
                testing = "Checking if there are http-addresses instead of https:";
                exploit = "By not having a https server the api is vulnerable for wifi attacks";
                cause = " -> is not https!";
                nice = "Urls seem to be ok, thats good!";
                break;
            
            //sec_schemes
            case "sec_schemes" :				
                testing = "Checking sec schemes:";
                exploit = "Scheme exploit possible";
                cause = " -> this is wrong";
                nice = "Security schemes seem to be ok";
                break;
        
            //data valid
            case "sec_field" :				
                testing = "Checking whether global security field exists and it is not empty:";
                exploit = "Global security field not defined or is empty";
                cause = "Undefined or empty";
                nice = "Global security field exists and is not empty";
                break;
        
            //unknown test
            default :				
                testing = "Starting a test, which I don't yet know";
                exploit = "Scheme exploit possible, don't know the exploit";
                cause = " -> this is wrong, don't know what it is";
                nice = "Test was ok, don't know what was tested";
                break;
        }
    
        //Print the current test number and the "key"
        outChannel.appendLine("Test " + securityTests + ": " + key);
        //print the starting line
        outChannel.appendLine(testing);
    
        //printing the results only if the status bit of that value is false == error
        if (value["status"] === false){
            for (let flaw in value) {
            //dont want to print the status row again though, so lets ignore that:
                if (flaw === "status") {
                continue;
                }
            //but for other errors, print the flaw and the cause
                if (value[flaw] === false) {
                    outChannel.appendLine(flaw + cause);
                }
            }
            //Print the possible exploit for these flaws
            outChannel.appendLine(exploit);
        }   

        //Otherwise, if no errors found, just print that the test was successful
        else {
            outChannel.appendLine(nice);
        }
    
        //The current test portion has now finished, starting new test (back to the start of the for-loop)
    }

    //Security testing ended, give total results, this total needs to be used again in next modules
    outChannel.appendLine("Tested " + securityTests + " test modules in this function");
    totalTests =+ securityTests;
    outChannel.appendLine("Tested " + totalTests + " in all test modules");
}