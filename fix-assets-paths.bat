@echo off
echo Fixing asset paths in src/screens/Screen folder...

REM Fix asset paths for files in Screen subfolder (need ../../../assets/)
for %%f in (src\screens\Screen\*.js) do (
    echo Fixing %%f...
    powershell -Command "(Get-Content '%%f') -replace 'require\(\x27\./assets/', 'require\(\x27../../../assets/' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace 'require\(\x27\.\./assets/', 'require\(\x27../../../assets/' | Set-Content '%%f'"
)

echo Asset paths fixed for Screen folder!
echo.

REM Fix asset paths for components (need ../../../assets/)
for %%f in (src\components\component\*.js) do (
    echo Fixing %%f...
    powershell -Command "(Get-Content '%%f') -replace 'require\(\x27\./assets/', 'require\(\x27../../../assets/' | Set-Content '%%f'"
    powershell -Command "(Get-Content '%%f') -replace 'require\(\x27\.\./assets/', 'require\(\x27../../../assets/' | Set-Content '%%f'"
)

echo Asset paths fixed for components!
pause
