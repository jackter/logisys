<?php
/**
 * This repository is for guidance purpose only.
 * You should create new repository files similar to this one that suit your actual real needs.
 * The repository files must be located in this directory only.
 * Please pay attention when configuring the paths; all the paths to JavaScript directories must be valid.
 * Please check the official documentation for more information.
 */

return array(
    __DIR__ . '/a/relative/path/to/js/files',                   //a relative path (relative to this file) to a directory that holds JavaScript files
    __DIR__ . '/another/relative/path/to/js/files',             //another relative path to a directory that holds other JavaScript files
    '/absolute/path/to/js/files1',                              //an absolute path to a directory that holds other JavaScript files
    '/absolute/path/to/js/files2',                              //an absolute path to a directory that holds other JavaScript files
    __DIR__ . '/../../php-javascript-obfuscator-demo/sample-js'   //this is a real path to some JavaScript files used in the demo
);
