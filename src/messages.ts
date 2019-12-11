import * as vscode from 'vscode';
import * as path from 'path';

const winston = require('winston');

//defining outChannel for the module
const outChannel = vscode.window.createOutputChannel('openAPI yaml tester');

//total number of tests, all modules, starts from zero (maybe needs var?)
//different names for functions, so those can be returned if needed somewhere else
let totalTests = 0;
let securityTests = 0;


//from https://stackoverflow.com/a/42637468 
//Get the path of the currently open file
let currentlyOpenFile = "hello.txt";

if (typeof vscode.window.activeTextEditor !== 'undefined') {
    currentlyOpenFile = vscode.window.activeTextEditor.document.fileName;	 
}

//find the location of the open file and create a folder and logfile there
//for example c:\Users\Käyttäjä\Documents\GitHub\petstore.yaml
//makes logFileDir to c:\Users\Käyttäjä\Documents\GitHub\petstore-log\
let logFileDir = path.dirname(currentlyOpenFile) + path.sep + 
    (path.basename(currentlyOpenFile, path.extname(currentlyOpenFile))) + 
    "-log";
let logFileName = "APItest.log";

//https://stackoverflow.com/questions/55583723/creating-a-log-file-for-a-vscode-extension
//creates logger (logger.info)
//stamps rows when logging
const logger = winston.createLogger({
    level: 'info',
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
        })
    ]
});
    
export function logFile() {
    outChannel.appendLine("Log saved to:");
    outChannel.appendLine(logFileDir + path.sep + logFileName);
}


export function reset() {
    totalTests = 0;
    securityTests = 0;
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
    if ((path.endsWith("yaml")) || (path.endsWith("yml"))) {
        vscode.window.showInformationMessage(path);
        outChannel.appendLine('File is yaml, OK!');
        logger.info('File is yaml, OK!');
    }
    else {
       outChannel.appendLine('File is not yaml, cannot test this!');
       logger.info('File is not yaml, cannot test this!');
    }
}


//trying to find an efficient way to iterate through object tree
//https://stackoverflow.com/questions/2549320/looping-through-an-object-tree-recursively
function parseObjectProperties (obj: { [x: string]: any; hasOwnProperty?: any; }, parse: { (logThis: any): void; (arg0: any): void; }) {
    for (var k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null) {
        parseObjectProperties(obj[k], parse);
        } else if (obj.hasOwnProperty(k)) {
        parse(obj[k]);
        }
    }
}


export function tests(results: {[index: string]:any}) {
    //prints the results from the tests
    //Iterate through the results of the readapi tests (security):

    //try to open the dictionary (object Object)
    //Object.entries(results).forEach(([test, thing]) => logger.info(test, thing));
   
   /* not working approach
    let merged = [].concat.apply([], results);
    logger.info(merged);
    */

	for (let key in results) {
        let value = results[key];      
        
        //we need to go deeper into the matrix
        /*
        for (let sub of results[key]) {
            logger.info(sub);
            for (let subsub of results[key][sub]) {
                logger.info(subsub);
                for (let subsubsub of results[key][sub][subsub]){
                    logger.info(subsubsub);
                }
            }
        }
        */

        //Increase the number of the test, so the total and current can be printed
        securityTests++;
    
        //declare the strings to be used first
        let testing;
        let exploit;
        let cause;
        let nice;
    
        //Change the strings according to the test name
        switch (key) {
        
            //addr_list
            case "addr_list" :
                testing = "Checking if there are http-addresses instead of https:";
                exploit = "When using http the traffic can be listened in wifi";
                cause = " -> is not https!";
                nice = "Urls seem to be https, thats good!";
                break;
            
            //sec_schemes
            case "sec_schemes" :				
                testing = "Checking securitySchemes:";
                exploit = "Without default-settings, its easy to forget security definitions";
                cause = "-> missing definitions";
                nice = "Security schemes seem to be ok";
                break;

            //sec_field
            case "sec_field" :				
                testing = "Checking whether global security field exists and it is not empty:";
                exploit = "Global security field not defined or is empty";
                cause = "-> undefined or empty definitions";
                nice = "Global security field exists and is not empty";
                break;

            //responses
            case "responses" :				
                testing = "Checking responses:";
                exploit = "Having undefined responses risks leaking data to attacker";
                cause = " -> missing response";
                nice = "Responses seem to be ok";
                break;
        
            //data valid
            case "param_schemas" :				
                testing = "Checking parameter schema definitions:";
                exploit = "API doesn't limit inputs, which may enable buffer overflows";
                cause = " -> missing definitions ";
                nice = "Type definitions seem to be ok";
                break;    

            case "schemas" :				
                testing = "Checking other schema definitions:";
                exploit = "Unexpected inputs can be sent, which may enable overflows or fails";
                cause = "-> missing definitions";
                nice = "schemas nice";
                break;

            //unknown test
            default :				
                testing = "Starting an unknown test";
                exploit = "Exploit possible, unknown test";
                cause = " -> this is wrong, unknown test";
                nice = "Test was ok, unknown test";
                break;
        }
    
        //Print the current test number and the "key"
        outChannel.appendLine("Test " + securityTests + ": " + key);
        logger.info("Test " + securityTests + ": " + key);

        //print the starting line
        outChannel.appendLine(testing);
        logger.info(testing);
    
        //printing the results only if the status bit of that value is false == error
        if (value["status"] === false){


            //using the parsing function to go through the tree and logging rows with errors
            parseObjectProperties(results, function (logThis: any) {
                logger.info(logThis);
               });   


            for (let flaw in value) {

            //dont want to print the status row again though, so lets ignore that:
                if (flaw === "status") {
                continue;
                }
            //but for other errors, print the flaw and the cause
            //this works for the https test, but not others
                if (value[flaw] === false) {
                    outChannel.appendLine(flaw + cause);
                    logger.info(flaw + cause);
                }
                
            }
            //Print the possible exploit for these flaws
            outChannel.appendLine(exploit);
            logger.info(exploit);
        }   

        //Otherwise, if no errors found, just print that the test was successful
        else {
            outChannel.appendLine(nice);
            logger.info(nice);
        }
    
        //The current test portion has now finished, starting new test (back to the start of the for-loop)
    }

    //Security testing ended, give total results, this total needs to be used again in next modules
    outChannel.appendLine("Tested " + securityTests + " test modules in this function");
    logger.info("Tested " + securityTests + " test modules in this function");
    totalTests =+ securityTests;
    outChannel.appendLine("Tested " + totalTests + " in all test modules");
    logger.info("Tested " + totalTests + " in all test modules");
}