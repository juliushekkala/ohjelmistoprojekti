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
    // Does NOT recognize entirely missing parameters as an error, just missing schemas
    var paths = this.yaml.paths;
    var problemparams: {[index: string]:any} = {};
    problemparams['status'] = true;
    problemparams.locations = [];
    for (let path in paths) {
        if (paths[path]['parameters'] !== undefined) {
            //Parameter object itself in [0], reference should be [1]
            if (paths[path]['parameters'][0]['schema'] === undefined) {
                let location = "paths" + path +  "/" + "parameters";
                problemparams.locations.push(location);
                if (problemparams['status']) {
                    problemparams['status'] = false;
                }
            }
        }
        for (let itemobject in paths[path]) {
            if (paths[path][itemobject]['parameters'] === undefined) {
                //No parameters here
                continue;
            }
            else {
                //Parameter object itself in [0], reference should be [1]
                if (paths[path][itemobject]['parameters'][0]['schema'] === undefined) {
                    let location = "paths" + path + "/" + itemobject + "/" + "parameters";
                    problemparams.locations.push(location);
                    if (problemparams['status']) {
                        problemparams['status'] = false;
                    }
                }
            }
        }
    
    }
    return problemparams;
}

public checkDataValidation() {
    var data_object: {[index: string]:any} = {};
    data_object['param_schemas'] = this.checkParamSchemas();
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

var schemes = Datacheck.checkDataValidation();
console.log(schemes);
*/