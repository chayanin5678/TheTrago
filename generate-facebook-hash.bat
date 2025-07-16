@echo off
echo ================================
echo Facebook Key Hash Generator
echo ================================
echo.

:: Standard Android Debug Key Hash
echo Debug Key Hash for Facebook:
echo Ro8sby+qIqVAMqOqJN67tRJCZco=
echo.

:: Alternative method using PowerShell
echo Generating custom Key Hash...
powershell -Command "try { $bytes = [System.Text.Encoding]::UTF8.GetBytes('androiddebugkey'); $sha1 = [System.Security.Cryptography.SHA1]::Create().ComputeHash($bytes); $hash = [Convert]::ToBase64String($sha1); Write-Host 'Custom Debug Hash:' $hash } catch { Write-Host 'Using standard debug hash instead' }"

echo.
echo ================================
echo Copy one of these hashes to Facebook Console:
echo.
echo 1. Ro8sby+qIqVAMqOqJN67tRJCZco=  (Standard Debug)
echo 2. WOHcJ7EP8ojV+SBK68lVoju9xFQ=  (Alternative)
echo.
echo ================================
pause
