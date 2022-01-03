/*
"use strict";
$.base64 = (function ($) {
    var _PADCHAR = "=",
        _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        _VERSION = "1.0";

    function _getbyte64(s, i) {
        var idx = _ALPHA.indexOf(s.charAt(i));
        if (idx === -1) {
            throw "Cannot decode base64"
        }
        return idx
    }

    function _decode(s) {
        var pads = 0,
            i, b10, imax = s.length,
            x = [];
        s = String(s);
        if (imax === 0) {
            return s
        }
        if (imax % 4 !== 0) {
            throw "Cannot decode base64"
        }
        if (s.charAt(imax - 1) === _PADCHAR) {
            pads = 1;
            if (s.charAt(imax - 2) === _PADCHAR) {
                pads = 2
            }
            imax -= 4
        }
        for (i = 0; i < imax; i += 4) {
            b10 = (_getbyte64(s, i) << 18) | (_getbyte64(s, i + 1) << 12) | (_getbyte64(s, i + 2) << 6) | _getbyte64(s, i + 3);
            x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 255, b10 & 255))
        }
        switch (pads) {
            case 1:
                b10 = (_getbyte64(s, i) << 18) | (_getbyte64(s, i + 1) << 12) | (_getbyte64(s, i + 2) << 6);
                x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 255));
                break;
            case 2:
                b10 = (_getbyte64(s, i) << 18) | (_getbyte64(s, i + 1) << 12);
                x.push(String.fromCharCode(b10 >> 16));
                break
        }
        return x.join("")
    }

    function _getbyte(s, i) {
        var x = s.charCodeAt(i);
        if (x > 255) {
            throw "INVALID_CHARACTER_ERR: DOM Exception 5"
        }
        return x
    }

    function _encode(s) {
        if (arguments.length !== 1) {
            throw "SyntaxError: exactly one argument required"
        }
        s = String(s);
        var i, b10, x = [],
            imax = s.length - s.length % 3;
        if (s.length === 0) {
            return s
        }
        for (i = 0; i < imax; i += 3) {
            b10 = (_getbyte(s, i) << 16) | (_getbyte(s, i + 1) << 8) | _getbyte(s, i + 2);
            x.push(_ALPHA.charAt(b10 >> 18));
            x.push(_ALPHA.charAt((b10 >> 12) & 63));
            x.push(_ALPHA.charAt((b10 >> 6) & 63));
            x.push(_ALPHA.charAt(b10 & 63))
        }
        switch (s.length - imax) {
            case 1:
                b10 = _getbyte(s, i) << 16;
                x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt((b10 >> 12) & 63) + _PADCHAR + _PADCHAR);
                break;
            case 2:
                b10 = (_getbyte(s, i) << 16) | (_getbyte(s, i + 1) << 8);
                x.push(_ALPHA.charAt(b10 >> 18) + _ALPHA.charAt((b10 >> 12) & 63) + _ALPHA.charAt((b10 >> 6) & 63) + _PADCHAR);
                break
        }
        return x.join("")
    }
    return {
        decode: _decode,
        encode: _encode,
        VERSION: _VERSION
    }
}($));

//$.base64.encode( "this is a test" );
//$.base64.decode( "dGhpcyBpcyBhIHRlc3Q=" );
function dxe(hash) {
    $.base64.encode(hash);
}

function dxd(hash) {
    eval($.base64.decode(hash));
}

function load_file(filename, filetype) {
    try {
        if (filetype == "js") {
            var fileref = document.createElement('script');
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", filename);
        } else if (filetype == "css") {
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", filename);
        }
        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    } catch (err) {}
}

function mod_file(mod, com, filename, obs) {
    try {
        var EXT = filename;
        EXT = EXT.split(".");
        EXT = EXT[EXT.length - 1];
        var filetype = EXT;
        //var PATH = HOST + "/modules/" + mod + "/" + com + "/assets/";
        var SRC = "modules/" + mod + "/" + com + "/assets/" + filename;
        var PATH = '';
        if (filetype == "js") {

            PATH = HOST + "/script/js." + obs + $.base64.encode(SRC);

            var fileref = document.createElement('script');
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", PATH);
        } else if (filetype == "css") {
            PATH = HOST + "/script/css." + $.base64.encode(SRC);
            var fileref = document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", PATH);
        }
        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    } catch (err) {console.log(filename + " Error")}
}

function PlugCSS(SRC){
    
    var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", HOST + "/" + SRC);

    if (typeof fileref != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}
*/

var _0x6dd0=["\x75\x73\x65\x20\x73\x74\x72\x69\x63\x74","\x62\x61\x73\x65\x36\x34","\x3D","\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4A\x4B\x4C\x4D\x4E\x4F\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5A\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6A\x6B\x6C\x6D\x6E\x6F\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7A\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x2B\x2F","\x31\x2E\x30","\x63\x68\x61\x72\x41\x74","\x69\x6E\x64\x65\x78\x4F\x66","\x43\x61\x6E\x6E\x6F\x74\x20\x64\x65\x63\x6F\x64\x65\x20\x62\x61\x73\x65\x36\x34","\x6C\x65\x6E\x67\x74\x68","\x66\x72\x6F\x6D\x43\x68\x61\x72\x43\x6F\x64\x65","\x70\x75\x73\x68","","\x6A\x6F\x69\x6E","\x63\x68\x61\x72\x43\x6F\x64\x65\x41\x74","\x49\x4E\x56\x41\x4C\x49\x44\x5F\x43\x48\x41\x52\x41\x43\x54\x45\x52\x5F\x45\x52\x52\x3A\x20\x44\x4F\x4D\x20\x45\x78\x63\x65\x70\x74\x69\x6F\x6E\x20\x35","\x53\x79\x6E\x74\x61\x78\x45\x72\x72\x6F\x72\x3A\x20\x65\x78\x61\x63\x74\x6C\x79\x20\x6F\x6E\x65\x20\x61\x72\x67\x75\x6D\x65\x6E\x74\x20\x72\x65\x71\x75\x69\x72\x65\x64","\x65\x6E\x63\x6F\x64\x65","\x64\x65\x63\x6F\x64\x65","\x6A\x73","\x73\x63\x72\x69\x70\x74","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x74\x79\x70\x65","\x74\x65\x78\x74\x2F\x6A\x61\x76\x61\x73\x63\x72\x69\x70\x74","\x73\x65\x74\x41\x74\x74\x72\x69\x62\x75\x74\x65","\x73\x72\x63","\x63\x73\x73","\x6C\x69\x6E\x6B","\x72\x65\x6C","\x73\x74\x79\x6C\x65\x73\x68\x65\x65\x74","\x74\x65\x78\x74\x2F\x63\x73\x73","\x68\x72\x65\x66","\x75\x6E\x64\x65\x66\x69\x6E\x65\x64","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x68\x65\x61\x64","\x67\x65\x74\x45\x6C\x65\x6D\x65\x6E\x74\x73\x42\x79\x54\x61\x67\x4E\x61\x6D\x65","\x2E","\x73\x70\x6C\x69\x74","\x6D\x6F\x64\x75\x6C\x65\x73\x2F","\x2F","\x2F\x61\x73\x73\x65\x74\x73\x2F","\x2F\x73\x63\x72\x69\x70\x74\x2F\x6A\x73\x2E","\x2F\x73\x63\x72\x69\x70\x74\x2F\x63\x73\x73\x2E","\x20\x45\x72\x72\x6F\x72","\x6C\x6F\x67"];_0x6dd0[0];$[_0x6dd0[1]]= (function(_0xa32ex1){var _0xa32ex2=_0x6dd0[2],_0xa32ex3=_0x6dd0[3],_0xa32ex4=_0x6dd0[4];function _0xa32ex5(_0xa32ex6,_0xa32ex7){var _0xa32ex8=_0xa32ex3[_0x6dd0[6]](_0xa32ex6[_0x6dd0[5]](_0xa32ex7));if(_0xa32ex8===  -1){throw _0x6dd0[7]};return _0xa32ex8}function _0xa32ex9(_0xa32ex6){var _0xa32exa=0,_0xa32ex7,_0xa32exb,_0xa32exc=_0xa32ex6[_0x6dd0[8]],_0xa32exd=[];_0xa32ex6= String(_0xa32ex6);if(_0xa32exc=== 0){return _0xa32ex6};if(_0xa32exc% 4!== 0){throw _0x6dd0[7]};if(_0xa32ex6[_0x6dd0[5]](_0xa32exc- 1)=== _0xa32ex2){_0xa32exa= 1;if(_0xa32ex6[_0x6dd0[5]](_0xa32exc- 2)=== _0xa32ex2){_0xa32exa= 2};_0xa32exc-= 4};for(_0xa32ex7= 0;_0xa32ex7< _0xa32exc;_0xa32ex7+= 4){_0xa32exb= (_0xa32ex5(_0xa32ex6,_0xa32ex7)<< 18)| (_0xa32ex5(_0xa32ex6,_0xa32ex7+ 1)<< 12)| (_0xa32ex5(_0xa32ex6,_0xa32ex7+ 2)<< 6)| _0xa32ex5(_0xa32ex6,_0xa32ex7+ 3);_0xa32exd[_0x6dd0[10]](String[_0x6dd0[9]](_0xa32exb>> 16,(_0xa32exb>> 8)& 255,_0xa32exb& 255))};switch(_0xa32exa){case 1:_0xa32exb= (_0xa32ex5(_0xa32ex6,_0xa32ex7)<< 18)| (_0xa32ex5(_0xa32ex6,_0xa32ex7+ 1)<< 12)| (_0xa32ex5(_0xa32ex6,_0xa32ex7+ 2)<< 6);_0xa32exd[_0x6dd0[10]](String[_0x6dd0[9]](_0xa32exb>> 16,(_0xa32exb>> 8)& 255));break;case 2:_0xa32exb= (_0xa32ex5(_0xa32ex6,_0xa32ex7)<< 18)| (_0xa32ex5(_0xa32ex6,_0xa32ex7+ 1)<< 12);_0xa32exd[_0x6dd0[10]](String[_0x6dd0[9]](_0xa32exb>> 16));break};return _0xa32exd[_0x6dd0[12]](_0x6dd0[11])}function _0xa32exe(_0xa32ex6,_0xa32ex7){var _0xa32exd=_0xa32ex6[_0x6dd0[13]](_0xa32ex7);if(_0xa32exd> 255){throw _0x6dd0[14]};return _0xa32exd}function _0xa32exf(_0xa32ex6){if(arguments[_0x6dd0[8]]!== 1){throw _0x6dd0[15]};_0xa32ex6= String(_0xa32ex6);var _0xa32ex7,_0xa32exb,_0xa32exd=[],_0xa32exc=_0xa32ex6[_0x6dd0[8]]- _0xa32ex6[_0x6dd0[8]]% 3;if(_0xa32ex6[_0x6dd0[8]]=== 0){return _0xa32ex6};for(_0xa32ex7= 0;_0xa32ex7< _0xa32exc;_0xa32ex7+= 3){_0xa32exb= (_0xa32exe(_0xa32ex6,_0xa32ex7)<< 16)| (_0xa32exe(_0xa32ex6,_0xa32ex7+ 1)<< 8)| _0xa32exe(_0xa32ex6,_0xa32ex7+ 2);_0xa32exd[_0x6dd0[10]](_0xa32ex3[_0x6dd0[5]](_0xa32exb>> 18));_0xa32exd[_0x6dd0[10]](_0xa32ex3[_0x6dd0[5]]((_0xa32exb>> 12)& 63));_0xa32exd[_0x6dd0[10]](_0xa32ex3[_0x6dd0[5]]((_0xa32exb>> 6)& 63));_0xa32exd[_0x6dd0[10]](_0xa32ex3[_0x6dd0[5]](_0xa32exb& 63))};switch(_0xa32ex6[_0x6dd0[8]]- _0xa32exc){case 1:_0xa32exb= _0xa32exe(_0xa32ex6,_0xa32ex7)<< 16;_0xa32exd[_0x6dd0[10]](_0xa32ex3[_0x6dd0[5]](_0xa32exb>> 18)+ _0xa32ex3[_0x6dd0[5]]((_0xa32exb>> 12)& 63)+ _0xa32ex2+ _0xa32ex2);break;case 2:_0xa32exb= (_0xa32exe(_0xa32ex6,_0xa32ex7)<< 16)| (_0xa32exe(_0xa32ex6,_0xa32ex7+ 1)<< 8);_0xa32exd[_0x6dd0[10]](_0xa32ex3[_0x6dd0[5]](_0xa32exb>> 18)+ _0xa32ex3[_0x6dd0[5]]((_0xa32exb>> 12)& 63)+ _0xa32ex3[_0x6dd0[5]]((_0xa32exb>> 6)& 63)+ _0xa32ex2);break};return _0xa32exd[_0x6dd0[12]](_0x6dd0[11])}return {decode:_0xa32ex9,encode:_0xa32exf,VERSION:_0xa32ex4}}($));function dxe(_0xa32ex11){$[_0x6dd0[1]][_0x6dd0[16]](_0xa32ex11)}function dxd(_0xa32ex11){eval($[_0x6dd0[1]][_0x6dd0[17]](_0xa32ex11))}function load_file(_0xa32ex14,_0xa32ex15){try{if(_0xa32ex15== _0x6dd0[18]){var _0xa32ex16=document[_0x6dd0[20]](_0x6dd0[19]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[21],_0x6dd0[22]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[24],_0xa32ex14)}else {if(_0xa32ex15== _0x6dd0[25]){var _0xa32ex16=document[_0x6dd0[20]](_0x6dd0[26]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[27],_0x6dd0[28]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[21],_0x6dd0[29]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[30],_0xa32ex14)}};if( typeof _0xa32ex16!= _0x6dd0[31]){document[_0x6dd0[34]](_0x6dd0[33])[0][_0x6dd0[32]](_0xa32ex16)}}catch(err){}}function mod_file(_0xa32ex18,_0xa32ex19,_0xa32ex14,_0xa32ex1a){try{var _0xa32ex1b=_0xa32ex14;_0xa32ex1b= _0xa32ex1b[_0x6dd0[36]](_0x6dd0[35]);_0xa32ex1b= _0xa32ex1b[_0xa32ex1b[_0x6dd0[8]]- 1];var _0xa32ex15=_0xa32ex1b;var _0xa32ex1c=_0x6dd0[37]+ _0xa32ex18+ _0x6dd0[38]+ _0xa32ex19+ _0x6dd0[39]+ _0xa32ex14;var _0xa32ex1d=_0x6dd0[11];if(_0xa32ex15== _0x6dd0[18]){_0xa32ex1d= HOST+ _0x6dd0[40]+ _0xa32ex1a+ $[_0x6dd0[1]][_0x6dd0[16]](_0xa32ex1c);var _0xa32ex16=document[_0x6dd0[20]](_0x6dd0[19]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[21],_0x6dd0[22]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[24],_0xa32ex1d)}else {if(_0xa32ex15== _0x6dd0[25]){_0xa32ex1d= HOST+ _0x6dd0[41]+ $[_0x6dd0[1]][_0x6dd0[16]](_0xa32ex1c);var _0xa32ex16=document[_0x6dd0[20]](_0x6dd0[26]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[27],_0x6dd0[28]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[21],_0x6dd0[29]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[30],_0xa32ex1d)}};if( typeof _0xa32ex16!= _0x6dd0[31]){document[_0x6dd0[34]](_0x6dd0[33])[0][_0x6dd0[32]](_0xa32ex16)}}catch(err){console[_0x6dd0[43]](_0xa32ex14+ _0x6dd0[42])}}function PlugCSS(_0xa32ex1c){var _0xa32ex16=document[_0x6dd0[20]](_0x6dd0[26]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[27],_0x6dd0[28]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[21],_0x6dd0[29]);_0xa32ex16[_0x6dd0[23]](_0x6dd0[30],HOST+ _0x6dd0[38]+ _0xa32ex1c);if( typeof _0xa32ex16!= _0x6dd0[31]){document[_0x6dd0[34]](_0x6dd0[33])[0][_0x6dd0[32]](_0xa32ex16)}}