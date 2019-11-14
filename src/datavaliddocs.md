# Documentation for the data validation testing module

## Object shape
Each function has own key that has object as value
status -key has boolean value, false if problems were found
Also includes the path for (if applicable) the problems, locations -key

## checkParamSchemas
Checks if each parameter object has a schema defined
Schemas limit accepted inputs (SQL injections)
Status is false if problems were found in a path. Paths with problems can be found in key locations (array)
key = param_schemas