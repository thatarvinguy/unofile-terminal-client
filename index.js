#!/usr/bin/env node

var fs = require("fs");
var request = require("http").request;

var action = process.argv[2];

switch (action) {
    case "-d":
        var fileCode = process.argv[3];
        request({
            host: "unofile.net",
            method: "GET",
            path: "/f/" + fileCode,
            headers: {}
        }, function(res) {
            var data = "";
            res.on("data", function(chunk) {
                data += chunk;
            });
            res.on("end", function() {
                if (data != "This file does not exist") {
                    var fileName = process.argv[4] || res.headers["content-disposition"].split("filename=")[1];
                    fs.access(fileName, fs.F_OK, function(err){
                        if (!err){
                            console.log(fileName + " already exists in this directory. Download with a different custom file name or change directories.");
                        }
                        else {
                            fs.writeFile(fileName, data, function(err) {
                                if (err) {
                                    console.error(err);
                                } else {
                                    console.log("Downloaded " + fileCode + " as " + fileName + ".");
                                }
                            });
                        }
                    });
                } else {
                    console.log("File does not exist.");
                }
            });
        }).end();
        break;
    case "-s":
    case "-u":
        var filePath = process.argv[3];
        var fileName = require("path").parse(filePath).base;
        var fileCode = process.argv[4];
        var fileData;
        var foreverStamp = "";
        if (action == "-s"){
            foreverStamp = "&forever=false"
        }
        try {
            fileData = fs.readFileSync(filePath);
        }
        catch (err){
            console.error(err);
            break;
        }
        request({
            host: "unofile-thepc.rhcloud.com",
            method: "POST",
            path: "/upload?file="+fileName+"&code="+fileCode+foreverStamp,
            headers: {}
        }, function(res) {
            var data = "";
            res.on("data", function(chunk) {
                data += chunk;
            });
            res.on("end", function() {
                if (data != "0"){
                    console.log("An error occured or that code is taken.");
                }
                else {
                    console.log("Uploaded " + fileName + " as " + fileCode + ".");
                }
            });
        }).end(fileData);
        break;
    default:
        console.log("Invalid action.");
}
