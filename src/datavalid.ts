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
