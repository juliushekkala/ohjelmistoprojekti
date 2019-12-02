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
Includes many subobject for different tests, each have their own status

## emptySchemas
Looks for empty schemas in the API, key = empty_schemas

## arraySchemaIssues
Checks schemas with type: 'array'
Checks if schemas have maxItems and types of items defined
Failure in this test can expose the server to attacks where unexpected data or large quantities of data is sent.
key = array_schemas

## numericSchemaIssues
Checks schemas with types 'integer' and 'number'
Checks if schemas have appropriate formats and maximum and minimum defined
Failure in this test can expose the server to attacks with unexpected inputs. This can lead to server crashes.
key = numeric_schemas