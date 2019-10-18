const yaml = require('js-yaml');
const fs   = require('fs');

//This file is imported to the main plugin file
//Includes functions that check security features of a OPENAPI-file

export function checkHTTP(doc: any) {
    //Returns an object (dictionary) where each found url is linked to boolean. True = https, False = http
    var servers = doc.servers;
    var addrlist: {[index: string]:any} = {};

    //Go through servers, check if their urls start with https and update object accordingly
    for (var server of servers) {
        var address = server['url'];
        //console.log(address);
        if (address.startsWith("https")){
            addrlist[address] = true;
        }
        else {
            addrlist[address] = false;
        }
    }
    //console.log(addrlist);
    return addrlist;
}

export function checkSecurityScheme(doc: any) {
    var secSchemes = doc.components.securitySchemes;
    if (typeof secSchemes === "undefined") {
        return false;
    }
    return secSchemes;
}

//Everything below is testing only and should always be commented out before committing changes
/*
try {
    var ymlfile = yaml.safeLoad(fs.readFileSync('test/petstore.yaml', 'utf8'));
} catch (e) {
    console.log(e);
}

var schemes = checkSecurityScheme(ymlfile);
console.log(schemes);*/