#!/usr/bin/phantomjs
'use strict;'
var fs=require('fs'),system=require('system'),
      urls_file, output_dir;


 function printUsage() { console.log([system.args[0] + " <urls file> <directory name> ",
                                      "\n\n",
                                     'Format of urls file: ',
                                     ' ',
                                     ' <url> <download file name> ',
                                     '',
                                     'Example:',
                                     '',
                                     'http://slashdot.org too_commercial.pdf',
                                     'http://yahoo.com thiswebsitesold.pdf',
                                     'http://gnu.org freesoftware.pdf',
                                     '',
                                     ].join('\n'))
                       }

(system.args.length === 3  )           || printUsage()                                                           || phantom.exit()


urls_file=system.args[1];
output_dir=system.args[2];
var dummy=function(){}
fs.exists(urls_file,dummy)             || console.log('File:' + urls_file + ' does not exist.')                  || phantom.exit()
fs.isReadable(urls_file)               || console.log('File:' + urls_file + ' is not readable.' )                || phantom.exit()
fs.isWritable(urls_file)               || console.log('File:' + urls_file + ' is not writeable.' )               || phantom.exit()
fs.exists(output_dir,dummy)            || console.log('Output directory:' + output_dir + ' does not exist.')     || phantom.exit()
fs.isDirectory(output_dir)             || console.log('Output directory:' + output_dir + ' is not a directory.') || phantom.exit()
fs.isWritable(output_dir,function(){}) || console.log('Output directory:' + output_dir + ' is not writeable.')   || phantom.exit()


function getNextValues (filename) {
    var content = '',
    f = null,
    lines = null,
    eol = system.os.name == 'windows' ? "\r\n" : "\n";
    var remove_comments=/(.*)#.*/;
    var urlfile=/^(.*)\s+(.*)/;
    try {
        f = fs.open(system.args[1], "r");
        content = f.read();
    } catch (e) {
        console.log("Error reading file: " + e);
        phantom.exit();
    }
    if (f) {
        f.close();
    }
    if (content) {
        lines = content.split(eol);
        for (var i = 0, len = lines.length; i < len; i++) {
            var s = lines[i].replace(remove_comments,"$1");
            var vals= s.match(urlfile);
            if (vals  && vals.length >2) {
                return {
                    url: vals[1],
                    output_filename: vals[2],
                    toString: function() { return JSON.stringify(this)
                                         }
                }
            }
        }
    }
}

console.log(getNextValues(urls_file).toString());






phantom.exit();

var page = require('webpage').create(),
    address, output, size;

if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: rasterize.js URL filename [paperwidth*paperheight|paperformat] [zoom]');
    console.log('  paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    console.log('  image (png/jpg output) examples: "1920px" entire page, window width 1920px');
    console.log('                                   "800px*600px" window, clipped to 800x600');
    phantom.exit(1);
} else {
    address = system.args[1];
    output = system.args[2];
    page.viewportSize = { width: 600, height: 600 };
    if (system.args.length > 3 && system.args[2].substr(-4) === ".pdf") {
        size = system.args[3].split('*');
        page.paperSize = size.length === 2 ? { width: size[0], height: size[1], margin: '0px' }
                                           : { format: system.args[3], orientation: 'portrait', margin: '1cm' };
    } else if (system.args.length > 3 && system.args[3].substr(-2) === "px") {
        size = system.args[3].split('*');
        if (size.length === 2) {
            pageWidth = parseInt(size[0], 10);
            pageHeight = parseInt(size[1], 10);
            page.viewportSize = { width: pageWidth, height: pageHeight };
            page.clipRect = { top: 0, left: 0, width: pageWidth, height: pageHeight };
        } else {
            console.log("size:", system.args[3]);
            pageWidth = parseInt(system.args[3], 10);
            pageHeight = parseInt(pageWidth * 3/4, 10); // it's as good an assumption as any
            console.log ("pageHeight:",pageHeight);
            page.viewportSize = { width: pageWidth, height: pageHeight };
        }
    }
    if (system.args.length > 4) {
        page.zoomFactor = system.args[4];
    }
    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit();
        } else {
            window.setTimeout(function () {
                page.render(output);
                phantom.exit();
            }, 200);
        }
    });
}
