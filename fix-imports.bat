@echo off
echo Fixing import paths in src folder...

REM Fix component imports
powershell -Command "(Get-Content 'src\screens\HomeScreen.js') -replace 'from '\''\.\/(component)\/', 'from '\''..\/components\/component\/' | Set-Content 'src\screens\HomeScreen.js'"
powershell -Command "(Get-Content 'src\screens\TripDetail.js') -replace 'from '\''\.\/(component)\/', 'from '\''..\/components\/component\/' | Set-Content 'src\screens\TripDetail.js'"

REM Fix Screen context imports  
powershell -Command "(Get-Content 'src\screens\HomeScreen.js') -replace 'from '\''\.\/(Screen)\/', 'from '\''\.\/Screen\/' | Set-Content 'src\screens\HomeScreen.js'"
powershell -Command "(Get-Content 'src\screens\TripDetail.js') -replace 'from '\''\.\/(Screen)\/', 'from '\''\.\/Screen\/' | Set-Content 'src\screens\TripDetail.js'"

echo Import paths fixed!
pause
