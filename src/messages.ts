import * as vscode from 'vscode';
import * as path from 'path';

const winston = require('winston');

//defining outChannel for the module
const outChannel = vscode.window.createOutputChannel('openAPI yaml tester');

//variables for ran tests
let ranTests: any = []; //this is used by all test modules
let ranTestTimes: any = []; //logging of tests ran
let ranTestsFailed: any = []; //logging of failed tests
let index: number;
let testedHere: number;
let testedHereFalse: number;

//declare the strings to be used first
let testing: string;
let exploit: string;
let cause: string;
let nice: string;

//arrays for parsing
let preSubs :any = [];
let parsedArray: any = []; //creates an empty array where fault-rows are put

//from https://stackoverflow.com/a/42637468 
//Get the path of the currently open file
let currentlyOpenFile = "hello.txt"; //in case there is nothing, removes some extra errors maybe

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
let debugFileName = "APIdebug.log";

//https://stackoverflow.com/questions/55583723/creating-a-log-file-for-a-vscode-extension
//creates logger (logger.info)
//stamps rows when logging
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.simple(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf((info: { timestamp: any; level: any; message: any; }) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.File({
            level: 'info', //logs info and more severe, use this for all output data + some extras
            dirname: logFileDir,
            filename: logFileName
        }),
        new winston.transports.File({
            level: 'silly', //logs silly and more severe, all info here
            dirname: logFileDir,
            filename: debugFileName
        })
    ]
    });

export function logFile() {
    outChannel.appendLine("Log saved to:");
    outChannel.appendLine(logFileDir + path.sep + logFileName);
}

//sets up output window for all other modules, clears it and shows it automatically
export function start() {
    outChannel.clear();
    //outChannel.appendLine('This is the output window for the extension');
    outChannel.show(true);
    
    //reset stuff just in case..
    ranTests= []; //this is used by all test modules
    ranTestTimes = []; //logging of tests ran
    ranTestsFailed = []; 
    index = 0;
    testedHere = 0;
    testedHereFalse = 0;
}

//prints time and the reason text
export function time(reason: string) {
    let currentTime = new Date();  
    //adding leading zero and slicing to get 2 last digits from all...
    outChannel.appendLine(reason + " " +
        ("0" + currentTime.getHours()).slice(-2) + ":" +
        ("0" + currentTime.getMinutes()).slice(-2) + ":" + 
        ("0" + currentTime.getSeconds()).slice(-2));
}

//prints file name
export function file(path: string) {
    outChannel.appendLine("Testing file: " + path);
}

//prints folder, not used?
export function folder(folder: string) {
    outChannel.appendLine("Located in folder: " + folder);
}

//tells whether the file is yaml or not
export function yaml(path: string) {
    if ((path.endsWith("yaml")) || (path.endsWith("yml"))) {
        vscode.window.showInformationMessage(path);
        //outChannel.appendLine('File is yaml, OK!'); //maybe this is not relevant
        logger.silly('File is yaml, OK!');
    }
    else {
       outChannel.appendLine('File is not yaml, cannot test this!');
       logger.info('File is not yaml, cannot test this!');
    }
}

//trying to find an efficient way to iterate through object tree
//found help from recursive function..
//https://stackoverflow.com/questions/2549320/looping-through-an-object-tree-recursively
function unfoldPackage (object: any, innerfunction: any, i: number) {
    //i should be 0 if its called from outside
    for (let sub in object) {
        let spaces = "[ ]"; //string with spaces for intendation
        if (typeof object[sub] === 'object') {
            innerfunction(spaces.repeat(i) + sub + ":" );
            //increase intendation with spaces, add i:
            i++;
            unfoldPackage(object[sub], innerfunction, i);
            if (i > 0) {
                //now the intendation gets smaller again
                i--;
            }
        } 
        else if (typeof object[sub] === 'string') {
            innerfunction(spaces.repeat(i) + sub + ": "+ '"' + object[sub] + '"');
        }
        else if (typeof object[sub] === 'boolean') {
            innerfunction(spaces.repeat(i)+ sub + ": " + object[sub].valueOf());
        }
        else {
            //try to find non-fitting types (none at the moment)
            innerfunction(spaces.repeat(i) + sub + " this is type " + typeof object[sub]);
        }
    }
}

function findFalses (object: any, innerfunction: any, i: number) {  
    //i should be 0 if its called from outside
    //this function parses the rows with falses into one row, with the upper objects
    for (let sub in object) {
        if (typeof object[sub] === 'object') {
            preSubs[i] = (sub);
            i++;
            findFalses(object[sub], innerfunction, i);
            if (i > 0) {i--;} //just for safety i>0
        } 
        else if (typeof object[sub] === 'string') {
            //no need to print strings?
        }
        else if (typeof object[sub] === 'boolean') {
            //log anyways, to get the numbers...
                let tempArray = [];
                //print previous folders now
                let rowString = "";
                for (let j=0; j<i; j++) {
                    rowString = rowString.concat(preSubs[j] + ": ");
                    tempArray.push(preSubs[j]);
                }
                logger.silly(rowString.concat(sub + ": " + object[sub].valueOf()));
                tempArray.push(sub);
                tempArray.push(object[sub].valueOf());
                parsedArray.push(tempArray);
        }
    }
}

export function resetParsedArray() {
    //reset the array, had some problems
    parsedArray = [];}

export function buildTrees(results: any) {
    //parse object trees into log file
    logger.silly("*************Start of object tree of test:*************");
    unfoldPackage(results, 
        function (logThis: any) {logger.silly(logThis);},
        0); //set intendation to 0 when first calling
    logger.silly("*************End of object tree of test*************");
}

export function parsed(results: any) {
    //this parses every boolean to their own rows
    logger.silly("*************Start of finder:*************");
    findFalses(results, 
        //function (parsedStatus: any) {textFeedback(parsedStatus);},
        function (parsedStatus: any) {textFeedback(parsedArray);},
        0); //set intendation to 0 when first calling
    logger.silly("*************End finder*************");
    //console.log(parsedArray);

    //TODO: locations folders in schemas are not logged or parsed here, so missing from the fails too...

    return parsedArray;
}

function selectTextStrings(moduleName: string) {
    //select the strings according to the test
    switch (moduleName) {
    
        //addr_list
        case "addr_list" :
            testing = "Checking if there are http-addresses instead of https:";
            exploit = "-> When using http the traffic can be listened in wifi";
            cause = " -> is not https!";
            nice = "-> Urls seem to be https, thats good!";
            break;

        //sec_schemes   
        case "sec_schemes" :				
            testing = "-> Checking securitySchemes:";
            exploit = "-> Without default-settings, its easy to forget security definitions";
            cause = "-> missing definitions";
            nice = "-> Security schemes seem to be ok";
            break;

        //sec_field
        case "sec_field" :				
            testing = "Checking whether global security field exists and it is not empty:";
            exploit = "-> Without default-settings, its easy to forget security definitions";
            cause = "-> undefined or empty definitions";
            nice = "-> Global security field exists and is not empty";
            break;

        //responses
        case "responses" :				
            testing = "Checking responses:";
            exploit = "-> Having undefined responses risks leaking data to attacker";
            cause = " -> missing response";
            nice = "-> Responses seem to be ok";
            break;
    
        //data valid
        case "param_schemas" :				
            testing = "Checking parameter schema definitions:";
            exploit = "-> API doesn't limit inputs, which may enable buffer overflows";
            cause = " -> missing definitions ";
            nice = "-> Type definitions seem to be ok";
            break;    

        case "schemas" :				
            testing = "Checking other schema definitions:";
            exploit = "-> Unexpected inputs can be sent, which may enable overflows or fails";
            cause = "-> missing definitions";
            nice = "-> Schemas seem to be ok";
            break;

        //unknown test
        default :				
            testing = "Starting an unknown test";
            exploit = "Exploit possible, unknown test";
            cause = " -> this is wrong, unknown test";
            nice = "Test was ok, unknown test";
            break;
    }
}

export function textFeedback (results: any) {
    
    for (let testArray in results) {
        let maincheck = results[testArray][0]; //get main-name of test function 
        
        //Change the strings according to the test name
        selectTextStrings(maincheck);

        //check if the test with same name has been already ran before
        if (ranTests.includes(maincheck)) {
        //do nothing
        }
        else {ranTests.push(maincheck);
            //also number of tests ran should be logged
            //a new test, ran tests should be resetted
            testedHere = 0;
            testedHereFalse = 0;
        }

        index = ranTests.indexOf(maincheck);
        if (ranTestsFailed[index] !== null) {
            ranTestsFailed[index] = 0;
        } //without faults this caused problems otherwise

        let rowWithFlaw = results[testArray].slice(1, -1).join(": "); //make the row readable
        let value =  (results[testArray].slice(-1)); //take the last value (status)
      
        //increase number of tests ran (last)
        testedHere++;
        ranTestTimes[index] = testedHere;
                
        //logger.info(typeof(value)); //type is object...
        if (value.toString() === "false" ) {
            //looks stupid, but finally works at least somehow
            //log the flaw-object and cause-text
            //outChannel.appendLine(rowWithFlaw + cause);
            logger.info(rowWithFlaw + cause); //maybe this needs to be logged for user
            testedHereFalse++;
            ranTestsFailed[index] = testedHereFalse;
        }
    ranTestTimes[index] = testedHere;
    ranTestsFailed[index] = testedHereFalse;
    }
}

export function endStats(){

    //put the arrays to log if needed
    /*
    console.log(ranTests);
    console.log(ranTestTimes);
    console.log(ranTestsFailed);
    */

    for (let i in ranTests) {

        //select the correct output lines
        selectTextStrings(ranTests[i]);

        logger.info("Test " + i + ": "  + testing); //checked...
        outChannel.appendLine("Test " + i + ": "  + testing); //checked...

        logger.info("Tested " + ranTestTimes[i] + " locations with " 
        + ranTestsFailed[i] + " failed tests");
        outChannel.appendLine("Tested " + ranTestTimes[i] + " locations with " 
        + ranTestsFailed[i] + " failed tests");

        if (ranTestsFailed[i] === 0) {
            logger.info(nice); //no errors
            outChannel.appendLine(nice); //no errors
        }
        else {
            logger.info(exploit); //possible exploit
            outChannel.appendLine(exploit); //possible exploit
        } 
    }
}

