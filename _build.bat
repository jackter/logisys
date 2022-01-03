echo off

copy _htdist\.htaccess dist\.htaccess
rmdir dist_local /s /q
echo D | xcopy /s dist dist_local