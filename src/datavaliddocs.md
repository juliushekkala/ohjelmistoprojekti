# Documentation for the data validation testing module

## Object shape
Each function has own key that has object as value
status -key has boolean value, false if problems were found
Also includes the path for (if applicable) the problems, locations -key

Current sample straight from terminal
{ param_schemas:
   { status: false,
     locations: [ 'paths/user/login/get/parameters' ] },
  schemas:
   { status: false,
     empty_schemas: { status: false, locations: [Array] } } }

## checkParamSchemas
Checks if each parameter object has a schema defined
Schemas limit accepted inputs (SQL injections)
Status is false if problems were found in a path. Paths with problems can be found in key locations (array)
key = param_schemas

## checkSchemas
First finds all schemas in API, then checks for vulnerabilities for each schema
key = schemas
<<<<<<< HEAD
Includes many subobject for different tests, each have their own status
=======
Includes many subobject for different tests, each have their own status
>>>>>>> a16e918f2ed1945c67b33df1f0a878276c9be6a7