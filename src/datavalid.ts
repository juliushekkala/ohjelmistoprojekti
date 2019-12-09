//This file is imported to the main plugin file
//Includes functions that check for data validation issues in the OPENAPI-contract

const yaml = require('js-yaml');
const fs   = require('fs');

export class Datavalidationcheck {

    yaml: any;
    constructor(doc: any) {
        this.yaml = doc;
    }

checkParamSchemas() {
    //Checks if each parameter object has a schema defined
    //Schemas limit accepted inputs (SQL injections)
    //Does NOT recognize entirely missing parameters as an error, just missing schemas
    var paths = this.yaml.paths;
    var problemparams: {[index: string]:any} = {};
    problemparams['status'] = true;
    problemparams.locations = [];
    for (let path in paths) {
        if (paths[path]['parameters'] !== undefined) {
            for (let i=0; i<paths[path]['parameters'].length; i++) {
                if (paths[path]['parameters'][i]['$ref'] === undefined) {
                    continue;
                }
                if (paths[path]['parameters'][i]['schema'] === undefined && paths[path]['parameters'][i]['content'] === undefined) {
                    let location = "paths" + path +  "/" + "parameters";
                    problemparams.locations.push(location);
                    if (problemparams['status']) {
                        problemparams['status'] = false;
                    }
                }
            }
        }
        for (let itemobject in paths[path]) {
            if (paths[path][itemobject]['parameters'] === undefined) {
                //No parameters here
                continue;
            }
            else {
                for (let i=0; i<paths[path][itemobject]['parameters'].length; i++) {
                    if (paths[path][itemobject]['parameters'][i]['$ref'] !== undefined) {
                        //Parameters defined elsewhere
                        continue;
                    }
                    if (paths[path][itemobject]['parameters'][i]['schema'] === undefined && paths[path][itemobject]['parameters'][i]['content'] === undefined) {
                        let location = "paths" + path + "/" + itemobject + "/" + "parameters";
                        problemparams.locations.push(location);
                        if (problemparams['status']) {
                            problemparams['status'] = false;
                        }
                    }
                }
            }
        }
    }
    var components = this.yaml.components;
    if (components['parameters'] !== undefined) {
        for (let param in components['parameters']) {
            if (components['parameters'][param]['$ref'] !== undefined) {
                //Parameters defined elsewhere
                continue;
            }
            else if (components['parameters'][param]['schema'] === undefined && components['parameters'][param]['content'] === undefined) {
                let location = "components/parameters/" + param;
                problemparams.locations.push(location);
                if (problemparams['status']) {
                    problemparams['status'] = false;
                }
            }
        }
    }
    //var testet = paths['/pet']['post']['requestBody']['$ref'];
    //console.log(testet);
    return problemparams;
}

checkSchemas() {
    var contract = this.yaml;
    var schemas: {[index: string]:any} = {};
    var schema_check: {[index: string]:any} = {};
    schema_check['status'] = true;
    for (let field in contract) {
        if (field === 'components') {
            for (let schema in contract['components']['schemas']) {
                let componentLocation = 'components/schemas' + '/' + schema;
                schemas[componentLocation] = contract['components']['schemas'][schema];
            }
        }
        if (typeof contract[field] === 'object') {
            let subObject = contract[field];
            this.findTargets('schema', subObject, schemas, field);
        }
    }
    schema_check['empty_schemas'] = this.emptySchemas(schemas);
    if (!schema_check['empty_schemas']['status']) {
        schema_check['status'] = false;
    }
    schema_check['array_schemas'] = this.arraySchemaIssues(schemas);
    if (!schema_check['array_schemas']['status']) {
        schema_check['status'] = false;
    }
    schema_check['numeric_schemas'] = this.numericSchemaIssues(schemas);
    if (!schema_check['numeric_schemas']['status']) {
        schema_check['status'] = false;
    }
    schema_check['string_schemas'] = this.stringSchemaIssues(schemas);
    if (!schema_check['string_schemas']['status']) {
        schema_check['status'] = false;
    }
    schema_check['object_schemas'] = this.objectSchemaIssues(schemas);
    if (!schema_check['object_schemas']['status']) {
        schema_check['status'] = false;
    }
    return schema_check;
}

emptySchemas(schemas: any) {
    var empty_schemas: {[index: string]:any} = {};
    empty_schemas['status'] = true;
    empty_schemas.locations = [];
    for (let schema in schemas) {
        if (Object.keys(schemas[schema]).length < 1) {
            empty_schemas.locations.push(schema);
            if (empty_schemas['status']) {
                empty_schemas['status'] = false;
            }
        }
    }
    return empty_schemas;
}

arraySchemaIssues(schemas: any) {
    //Checks schemas with type: 'array'
    //Checks if schemas have maxItems and types of items defined
    //Failure in this test can expose the server to attacks where unexpected data or large quantities of data is sent
    var array_schemas: {[index: string]:any} = {};
    array_schemas['status'] = true;
    array_schemas.locations = [];
    for (let schema in schemas) {
        let schematype = schemas[schema]['type'];
        if (schematype === 'object') {
            if (schemas[schema]['properties'] !== undefined) {
                let typeschemas: {[index: string]:any} = {};
                let statbool = true; //Schemas should be added to array_schemas only once
                this.findSchemasOfType('array', schemas[schema]['properties'], typeschemas);
                for (let typeschema in typeschemas) {
                    if (typeschemas[typeschema]['maxItems'] === undefined) {
                        if (statbool) {
                            array_schemas.locations.push(schema);
                            if (array_schemas['status']) {
                                array_schemas['status'] = false;
                            }
                        }
                        statbool = false;
                    }
                    else if (schemas[schema]['items']['type'] === undefined && schemas[schema]['items']['$ref'] === undefined) {
                        if (statbool) {
                            array_schemas.locations.push(schema);
                            if (array_schemas['status']) {
                                array_schemas['status'] = false;
                            }
                        }
                        statbool = false;
                    }
                }
            }
        }
        else if (schematype === 'array') {
            if (schemas[schema]['maxItems'] === undefined) {
                array_schemas.locations.push(schema);
                if (array_schemas['status']) {
                    array_schemas['status'] = false;
                }
            }
            else if (schemas[schema]['items']['type'] === undefined && schemas[schema]['items']['$ref'] === undefined) {
                array_schemas.locations.push(schema);
                if (array_schemas['status']) {
                    array_schemas['status'] = false;
                }
            }
        }
    }
    return array_schemas;
}

numericSchemaIssues(schemas: any) {
    //Checks schemas with types 'integer' and 'number'
    //Checks if schemas have proper formats, (int64, int32 or float, double)
    //Unspecified format can lead to unexpected errors when unexpected inputs are used
    var numeric_schemas: {[index: string]:any} = {};
    numeric_schemas['status'] = true;
    numeric_schemas.locations = [];
    for (let schema in schemas) {
        let schematype = schemas[schema]['type'];
        if (schematype === 'object') {
            if (schemas[schema]['properties'] !== undefined) {
                let typeschemas: {[index: string]:any} = {};
                let statbool = true; //Schemas should be added to numeric_schemas only once
                this.findSchemasOfType('integer', schemas[schema]['properties'], typeschemas);
                this.findSchemasOfType('number', schemas[schema]['properties'], typeschemas);
                for (let typeschema in typeschemas) {
                    if (typeschemas[typeschema]['type'] === 'integer') { 
                        if (typeschemas[typeschema]['format'] !== 'int32' && typeschemas[typeschema]['format'] !== 'int64' && statbool) { //Expected input to cut down possible attack vectors
                            numeric_schemas.locations.push(schema);
                            if (numeric_schemas['status']) {
                                numeric_schemas['status'] = false;
                            }
                            statbool = false;
                        }
                        else if ((typeschemas[typeschema]['maximum'] === undefined ||  typeschemas[typeschema]['minimum'] === undefined) && statbool) { //Maximum and minimum values to limit attack vectors
                            numeric_schemas.locations.push(schema);
                            if (numeric_schemas['status']) {
                                numeric_schemas['status'] = false;
                            }
                            statbool = false;
                        }
                    }
                    if (typeschemas[typeschema]['type'] === 'number') {
                        if (typeschemas[typeschema]['format'] !== 'float' && typeschemas[typeschema]['format'] !== 'double' && statbool) {
                            numeric_schemas.locations.push(schema);
                            if (numeric_schemas['status']) {
                                numeric_schemas['status'] = false;
                            }
                            statbool = false;
                        }
                        else if ((typeschemas[typeschema]['maximum'] === undefined ||  typeschemas[typeschema]['minimum'] === undefined) && statbool) { //Maximum and minimum values to limit attack vectors
                            numeric_schemas.locations.push(schema);
                            if (numeric_schemas['status']) {
                                numeric_schemas['status'] = false;
                            }
                            statbool = false;
                        }
                    }
                }
                
            }
        }
        else if (schematype === 'integer') {
            if (schemas[schema]['format'] !== "int32" && schemas[schema]['format'] !== "int64") {
                numeric_schemas.locations.push(schema);
            }
            else if (schemas[schema]['maximum'] === undefined || schemas[schema]['minimum'] === undefined) { //Maximum and minimum values to limit attack vectors
                numeric_schemas.locations.push(schema);
            }
        }
        else if (schematype === 'number') {
            if (schemas[schema]['format'] !== "float" && schemas[schema]['format'] !== "double") {
                numeric_schemas.locations.push(schema);
            }
            else if (schemas[schema]['maximum'] === undefined || schemas[schema]['minimum'] === undefined) { //Maximum and minimum values to limit attack vectors
                numeric_schemas.locations.push(schema);
            }
        }
    }
    return numeric_schemas;
}

stringSchemaIssues(schemas: any) {
    //Checks schemas with type 'string'
    //Checks if schemas have maximum string length and string pattern defined
    //No maximum length can expose the server to overloading attacks. Lack of pattern could allow various attacks, including SQL injections
    var string_schemas: {[index: string]:any} = {};
    string_schemas['status'] = true;
    string_schemas.locations = [];
    for (let schema in schemas) {
        let schematype = schemas[schema]['type'];
        if (schematype === 'object') {
            if (schemas[schema]['properties'] !== undefined) {
                let typeschemas: {[index: string]:any} = {};
                let statbool = true; //Schemas should be added to numeric_schemas only once
                this.findSchemasOfType('string', schemas[schema]['properties'], typeschemas);
                for (let typeschema in typeschemas) {
                    if (typeschemas[typeschema]['maxLength'] === undefined || typeschemas[typeschema]['pattern'] === undefined) {
                        if (statbool) {
                            string_schemas.locations.push(schema);
                            if (string_schemas['status']) {
                                string_schemas['status'] = false;
                            }
                        }
                        statbool = false;
                    }
                }
            }
        }
        else if (schematype === 'string') {
            if (schemas[schema]['maxLength'] === undefined || schemas[schema]['pattern'] === undefined) {
                string_schemas.locations.push(schema);
                if (string_schemas['status']) {
                    string_schemas['status'] = false;
                }
            }
        }
    }
    return string_schemas;
}

objectSchemaIssues(schemas: any) {
    //Checks schemas type 'object'
    //Checks if schemas have properties defined and additional properties blocked
    //Checks if subschemas have types
    var object_schemas: {[index: string]:any} = {};
    object_schemas['status'] = true;
    object_schemas.locations = [];
    for (let schema in schemas) {
        let schematype = schemas[schema]['type'];
        if (schematype === 'object') {
            if (schemas[schema]['properties'] === undefined || schemas[schema]['additionalProperties'] !== false) {
                object_schemas.locations.push(schema);
                if (object_schemas['status']) {
                    object_schemas['status'] = false;
                }
            }
            else {
                let typestatus = this.checkValueTypes(schemas[schema]['properties']);
                if (!typestatus) {
                    object_schemas.locations.push(schema);
                    if (object_schemas['status']) {
                        object_schemas['status'] = false;
                    }
                }
            }
        }
    }
    return object_schemas;
}

checkValueTypes(props: any): boolean{
    //Used for checking if subschemas have types
    let typestatus = true;
    for (let schema in props) {
        if (props[schema] === null) {
            //Subschema is empty, thus is an issue
            typestatus = false;
            continue;
        }
        if (props[schema]['type'] === 'object' && typestatus) {
            if (props[schema]['properties'] !== undefined) {
                typestatus = this.checkValueTypes(props[schema]['properties']);
            }
        }
        else if (props[schema]['type'] === undefined && typestatus){
            typestatus = false;
        }
    }
    return typestatus;
}


findSchemasOfType(type: string, props: any, collection: any) {
    //For finding schemas within schemas
    for (let schema in props) {
        if (props[schema] === null) {
            continue;
        }
        let schematype = props[schema]['type'];
        if (schematype === 'object') {
            if (props[schema]['properties'] !== undefined) {
                this.findSchemasOfType(type, props[schema]['properties'], collection);
            }
        }
        else if (schematype === type) {
            collection[schema] = props[schema];
        }
    }
    return;
}

public findTargets(target: string, obj: any, collection: any, location: string) {
    //Recursively looks for occurrances of target in obj
    //Found occurrances and their location is saved in collection
    //console.log('In location: ' + location);
    for (let field in obj) {
        if (typeof obj[field] === 'object') {
            if (obj[field][target] !== undefined) {
                let schema_location = location + '/' +  field + '/' + target;
                collection[schema_location] = obj[field][target];
            }
            else {
                let subObject = obj[field];
                let subLocation = location + '/' + field;
                this.findTargets(target, subObject, collection, subLocation);
            }
        }
    }
    return;
}


public checkDataValidation() {
    var data_object: {[index: string]:any} = {};
    data_object['param_schemas'] = this.checkParamSchemas();
    data_object['schemas'] = this.checkSchemas();
    console.log(data_object);
    return data_object;
}
}

//Everything below is testing only and should always be commented out before committing changes
/*
try {
    var ymlfile = yaml.safeLoad(fs.readFileSync('test/petstore.yaml', 'utf8'));
} catch (e) {
    console.log(e);
}

let Datacheck = new Datavalidationcheck(ymlfile);

var data = Datacheck.checkDataValidation();
console.log(data);
*/
