set h=%cd%
%ADDON_SDK_HOME:~0,1%:
cd %ADDON_SDK_HOME%
call bin\activate.bat
%h:~0,1%:
cd %h%
start
