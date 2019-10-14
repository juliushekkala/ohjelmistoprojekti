const yaml = require('js-yaml');
const fs   = require('fs');

//This file is imported to the main plugin file
//Includes functions that check security features of a OPENAPI-file

function checkHTTP(doc) {
    var servers = doc.servers;
    for (var server of servers) {
        var address = server['url'];
        console.log(address);
    }
}

try {
    var ymlfile = yaml.safeLoad(fs.readFileSync('src/test/petstore.yaml', 'utf8'));
} catch (e) {
    console.log(e);
}

checkHTTP(ymlfile);