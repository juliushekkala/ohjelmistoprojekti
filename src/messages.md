# Documentation for the output module

This module parses the output of the test into "Output" window.
It also creates the log file using winston-module.

## Log folder
Module takes the location of the open file from vscode and parses it using path-module.
Creates a folder and logfile there.

For example testing c:\Users\User\Documents\GitHub\petstore.yaml
makes logfile called APItest.log to c:\Users\User\Documents\GitHub\petstore-log\

If the file exists, the rows are just added into the file.

This creation and modifying might cause issues later.

## logger

saves the parameter into log-file, and timestamps it.

## Tests run 

readapi.ts
    api_object['addr_list'] = this.checkHTTP();
    api_object['sec_schemes'] = this.checkSecurityScheme();
    api_object['sec_field'] = this.checkSecurityField();
    api_object['responses'] = this.responseCheck();

datavalid.ts
    data_object['param_schemas'] = this.checkParamSchemas();
    data_object['schemas'] = this.checkSchemas();

