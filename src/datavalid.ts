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

public checkDataValidation() {
    var data_object: {[index: string]:any} = {};
    data_object['param_schemas'] = this.checkParamSchemas();
    return data_object;
}
}

//Everything below is testing only and should always be commented out before committing changes
/*
try {
    var ymlfile = yaml.safeLoad(fs.readFileSync('test/link.yaml', 'utf8'));
} catch (e) {
    console.log(e);
}

let Datacheck = new Datavalidationcheck(ymlfile);

var schemes = Datacheck.checkDataValidation();
console.log(schemes);
*/