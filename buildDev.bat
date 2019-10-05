@echo off

xcopy ..\mimbl\package.json node_modules\mimbl\ /i /y /d >nul
xcopy ..\mimbl\lib\*.* node_modules\mimbl\lib\ /s /i /y /d >nul

xcopy ..\mimurl\package.json node_modules\mimurl\ /i /y /d >nul
xcopy ..\mimurl\lib\*.* node_modules\mimurl\lib\ /s /i /y /d >nul

webpack --display-error-details
