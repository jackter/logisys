<?php
/**
 * Configuration preset: default obfuscation protection.
 * This configuration preset will be automatically used if there is no other specified.
 * You can create new configuration preset files only in this directory and use them when calling the obfuscation engine.
 * For instance, if 'my-config.php' will be you new configuration file, you should use it like this: jso.php?jrs=my-repository/my-js-file.js&cfg=my-config
 * Please check the official documentation for more information.
 */

$config = new wlJSOConfig();
$config->DO_DECOY = true;
$config->DO_MINIFY = true;
$config->DO_LOCK_DOMAIN = true;
$config->DO_SCRAMBLE_VARS = true;
$config->ENCRYPTION_LEVEL = 1;
$config->SHOW_JS_LOCK_ALERTS = false;
$config->CACHE_LEVEL = 2;
$config->EXPIRATION_DATE = null;
$config->SHOW_WISELOOP_SIGNATURE = false;
return $config;
