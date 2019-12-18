# Documentation for the output module

This module parses the output of the test into "Output" window.
It also creates the log file using winston-module.

# Log folder
Module takes the location of the open file from vscode and parses it using path-module.
Creates a folder and logfile there.

For example testing c:\Users\User\Documents\GitHub\petstore.yaml
makes logfile called APItest.log to c:\Users\User\Documents\GitHub\petstore-log\

If the file exists, the rows are just added into the file.

This creation and modifying might cause issues later.
TODO: Choose the folder
TODO: Something breaks in file generator when opening multiple files

## logger

saves the parameter into log-file, and timestamps it.

# Functions:

## logFile()

Gives the log file location.

## start()

Starts logging, resets some stuff for bug splatting purposes

## time(reason) 

Gives current time with the reason in the text.

## file(path)

Gives the file path.

## folder(folder) 

Gives the folder (unused?)

## yaml(path) 

Check that the file is .yaml or .yml

## unfoldPackage (object, innerfunction, i)



## findFalses (object: any, innerfunction, i) 

Generates array, where tests with problems found are put into one row with their upper objects.

## resetParsedArray()

Empties array for findFalses

## buildTrees(results)

Parses the results from test files into a tree-type view for logging

## parsed(results)
                

## selectTextStrings(moduleName) 

Select the text outputs (test name, possible exploits...) based on the moduleName

## generateArrays(results) 

Parses through the array, and generates:
    ranTests[]
    ranTestsFailed[]
    ranTestTimes[]
Also logs the faulty rows.


## endStats()

Outputs and logs the stats of tests run using arrays from generateArrays.