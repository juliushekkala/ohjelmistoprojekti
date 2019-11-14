const yaml = require('js-yaml');
const fs   = require('fs');

//This file is imported to the main plugin file
//Includes functions that check security features of a OPENAPI-file

export class Apicheck {

    yaml: any;
    constructor(doc: any) {
        this.yaml = doc;
    }
checkHTTP() {
    //Returns an object (dictionary) where each found url is linked to boolean. True = https, False = http
    var servers = this.yaml.servers;
    var addr_list: {[index: string]:any} = {};

    //Go through servers, check if their urls start with https and update object accordingly
    for (var server of servers) {
        var address = server['url'];
        //console.log(address);
        if (address.startsWith("https")){
            addr_list[address] = true;
        }
        else {
            addr_list[address] = false;
            addr_list['status'] = false;
        }
    }
    //console.log(addrlist);
    return addr_list;
}

checkSecurityScheme() {
    var sec_schemes = this.yaml.components.securitySchemes;
    if (typeof sec_schemes === "undefined") {
        let sec_schemes: {[index: string]:boolean} = {};
        sec_schemes['status'] = false;
        return sec_schemes;
    }
    sec_schemes['status'] = true;
    return sec_schemes;
}

//Check whether global security field is defined && that it is not an empty array
checkSecurityField() {
    var sec_field = this.yaml.security;
    //not defined
    if (typeof sec_field === "undefined") {
        let sec_field: {[index: string]:boolean} = {};
        sec_field['status'] = false;
        return sec_field;
    }

    //if the security field is just an empty array
    if (sec_field.length === 0) {
        let sec_field: {[index: string]:boolean} = {};
        sec_field['status'] = false;
        return sec_field;  
    }

    //if there are empty security requirements (as in just "- {}"))
    if (sec_field.length > 0) {
        for (var sec in sec_field) {
            if (Object.keys(sec_field[sec]).length === 0) {
                let sec_field: {[index: string]:boolean} = {};
                sec_field['status'] = false;
                return sec_field;  
            }
        }
    }
    
    
    sec_field['status'] = true;
    console.log(sec_field);
    return sec_field;
}

public checkSecurity() {
    var api_object: {[index: string]:any} = {};
    api_object['addr_list'] = this.checkHTTP();
    api_object['sec_schemes'] = this.checkSecurityScheme();
    api_object['sec_field'] = this.checkSecurityField();
    return api_object;
}
}

//Everything below is testing only and should always be commented out before committing changes
/* 
try {
    var ymlfile = yaml.safeLoad(fs.readFileSync('test/petstore.yaml', 'utf8'));
} catch (e) {
    console.log(e);
}

var schemes = checkSecurity(ymlfile);
console.log(schemes);
*/