@echo off
setlocal enabledelayedexpansion

echo ===== Git Commit and Push Helper =====

:: Check current branch
for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%a
echo Current branch: %current_branch%

:: Check changes
git status
echo.

:: Check if there are any changes
git diff-index --quiet HEAD
if %errorlevel% equ 0 (
    echo No changes to commit.
    goto :end
)

:: Stage all files
git add .
echo All files have been staged.
echo.

:: Get commit message
set /p commit_msg="Enter commit message: "

:: Check if input is empty
if "!commit_msg!"=="" (
    echo Commit message is empty. Operation aborted.
    goto :end
)

:: Execute commit
git commit -m "!commit_msg!"
if %errorlevel% neq 0 (
    echo An error occurred during commit.
    goto :end
)
echo Commit completed.
echo.

:: Confirm push
set /p push_confirm="Do you want to push changes to remote repository? (y/n): "
if /i "!push_confirm!"=="y" (
    git push origin %current_branch%
    if %errorlevel% equ 0 (
        echo Push completed.
    ) else (
        echo An error occurred during push.
    )
) else (
    echo Push cancelled.
)

:end
echo.
echo ===== Operation Completed =====
pause