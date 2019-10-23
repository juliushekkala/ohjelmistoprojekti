const yaml = require('js-yaml');
const fs   = require('fs');

//This file is imported to the main plugin file
//Includes functions that check security features of a OPENAPI-file

export class Apicheck {

    yaml: any;
    constructor(doc: any) {
        this.yaml = doc;
    }
checkHTTP(doc: any) {
    //Returns an object (dictionary) where each found url is linked to boolean. True = https, False = http
    var servers = doc.servers;
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
        }
    }
    //console.log(addrlist);
    return addr_list;
}

checkSecurityScheme(doc: any) {
    var sec_schemes = doc.components.securitySchemes;
    if (typeof sec_schemes === "undefined") {
        return false;
    }
    return sec_schemes;
}

public checkSecurity(doc: any) {
    var api_object: {[index: string]:any} = {};
    api_object['addr_list'] = this.checkHTTP(this.yaml);
    api_object['sec_schemes'] = this.checkSecurityScheme(this.yaml);
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