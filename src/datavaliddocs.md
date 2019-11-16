# Documentation for the data validation testing module

## Object shape
Each function has own key that has object as value
status -key has boolean value, false if problems were found
<<<<<<< HEAD
<<<<<<< HEAD
Also includes the path for (if applicable) the problems, locations -key

Current sample straight from terminal
{ param_schemas:
   { status: false,
     locations: [ 'paths/user/login/get/parameters' ] },
  schemas:
   { status: false,
     empty_schemas: { status: false, locations: [Array] } } }
=======
Also includes the path for the problems, locations -key
>>>>>>> Work on paramschemas
=======
Also includes the path for (if applicable) the problems, locations -key
>>>>>>> Started work on finding schemas from api

## checkParamSchemas
Checks if each parameter object has a schema defined
Schemas limit accepted inputs (SQL injections)
Status is false if problems were found in a path. Paths with problems can be found in key locations (array)
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Empty schema check, component schema search
key = param_schemas

## checkSchemas
First finds all schemas in API, then checks for vulnerabilities for each schema
key = schemas
<<<<<<< HEAD
Includes many subobject for different tests, each have their own status
=======
key = param_schemas
>>>>>>> Work on paramschemas
=======
Includes many subobject for different tests, each have their own status
>>>>>>> Empty schema check, component schema search
