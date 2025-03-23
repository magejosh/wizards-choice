@echo off
REM Script to remove duplicate files in src/js/core and src/js/ui
REM This script should be run from the project root directory

echo Removing duplicate files in src/js/core and src/js/ui...

REM Process core directory
if exist "src\js\core" (
    REM Check if src/game/core exists
    if not exist "src\game\core" (
        echo Directory src/game/core does not exist. Cannot proceed with removal of src/js/core.
    ) else (
        REM Create a backup directory for core
        set BACKUP_DIR_CORE=backup_js_core_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
        set BACKUP_DIR_CORE=%BACKUP_DIR_CORE: =0%
        mkdir "%BACKUP_DIR_CORE%"

        REM Copy all files from src/js/core to the backup directory
        xcopy "src\js\core\*" "%BACKUP_DIR_CORE%\" /E /I /Y
        echo Backup of core files created in %BACKUP_DIR_CORE%

        REM Remove the src/js/core directory
        rmdir /S /Q "src\js\core"
        echo Removed src/js/core directory
    )
) else (
    echo Directory src/js/core does not exist. Nothing to remove.
)

REM Process ui directory
if exist "src\js\ui" (
    REM Check if src/game/ui exists
    if not exist "src\game\ui" (
        echo Directory src/game/ui does not exist. Cannot proceed with removal of src/js/ui.
    ) else (
        REM Create a backup directory for ui
        set BACKUP_DIR_UI=backup_js_ui_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
        set BACKUP_DIR_UI=%BACKUP_DIR_UI: =0%
        mkdir "%BACKUP_DIR_UI%"

        REM Copy all files from src/js/ui to the backup directory
        xcopy "src\js\ui\*" "%BACKUP_DIR_UI%\" /E /I /Y
        echo Backup of ui files created in %BACKUP_DIR_UI%

        REM Remove the src/js/ui directory
        rmdir /S /Q "src\js\ui"
        echo Removed src/js/ui directory
    )
) else (
    echo Directory src/js/ui does not exist. Nothing to remove.
)

echo Duplicate files have been removed. Backups were created if needed.
echo The src/js/main.js file redirects to src/game/main.js for HTML compatibility.
echo The src/js/ui files redirect to their corresponding src/game/ui files.