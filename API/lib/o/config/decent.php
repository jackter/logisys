<?php
/**
 * Configuration preset: decent obfuscation protection.
 * You can create new configuration preset files only in this directory and use them when calling the obfuscation engine.
 * This configuration file should be used like this: jso.php?jrs=my-repository/my-js-file.js&cfg=decent
 * Please check the official documentation for more information.
 */

$config = new wlJSOConfig();
$config->DO_DECOY = false;
$config->DO_MINIFY = true;
$config->DO_LOCK_DOMAIN = false;
$config->DO_SCRAMBLE_VARS = false;
$config->ENCRYPTION_LEVEL = 1;
$config->SHOW_JS_LOCK_ALERTS = true;
$config->CACHE_LEVEL = 2;
$config->EXPIRATION_DATE = null;
$config->SHOW_WISELOOP_SIGNATURE = false;
return $config;
