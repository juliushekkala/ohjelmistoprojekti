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
    var paths = this.yaml.paths;
    var problemparams: {[index: string]:any} = {};
    problemparams.status = true;
    problemparams.locations = [];
    for (let path in paths) {
        for (let itemobject in paths[path]) {
            if (paths[path][itemobject]['parameters'] === undefined) {
                //No parameters here
                let location = "paths" + path + "/" + itemobject;
                problemparams.locations.push(location);
                if (problemparams.status) {
                    problemparams.status = false;
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