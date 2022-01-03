echo off

copy _htdist\online.htaccess dist\.htaccess
rmdir dist_online /s /q
echo D | xcopy /s dist dist_online