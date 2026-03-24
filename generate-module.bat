@echo off
set /p moduleName="Enter Module Name: "
if "%moduleName%"=="" (
    echo Module name is required!
    pause
    exit /b
)
node generate-module.js %moduleName%
pause
