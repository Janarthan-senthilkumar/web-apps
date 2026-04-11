@echo off
echo Starting install... > install_log.txt
cd /d "c:\Users\janar\.gemini\antigravity\playground\shadow-event\inventory-tracker\backend"
echo Installing backend... >> ..\install_log.txt
call npm install >> ..\install_log.txt 2>&1
echo BACKEND_DONE >> ..\install_log.txt
cd /d "c:\Users\janar\.gemini\antigravity\playground\shadow-event\inventory-tracker\frontend"
echo Installing frontend... >> ..\install_log.txt
call npm install >> ..\install_log.txt 2>&1
echo FRONTEND_DONE >> ..\install_log.txt
echo ALL_COMPLETE >> ..\install_log.txt
