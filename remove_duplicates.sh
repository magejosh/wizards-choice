#!/bin/bash

# Script to remove duplicate files in src/js/core and src/js/ui
# This script should be run from the project root directory

echo "Removing duplicate files in src/js/core and src/js/ui..."

# Process core directory
if [ -d "src/js/core" ]; then
    # Check if src/game/core exists
    if [ ! -d "src/game/core" ]; then
        echo "Directory src/game/core does not exist. Cannot proceed with removal of src/js/core."
    else
        # Create a backup directory for core
        BACKUP_DIR_CORE="backup_js_core_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR_CORE"

        # Copy all files from src/js/core to the backup directory
        cp -r src/js/core/* "$BACKUP_DIR_CORE/"
        echo "Backup of core files created in $BACKUP_DIR_CORE"

        # Remove the src/js/core directory
        rm -rf src/js/core
        echo "Removed src/js/core directory"
    fi
else
    echo "Directory src/js/core does not exist. Nothing to remove."
fi

# Process ui directory
if [ -d "src/js/ui" ]; then
    # Check if src/game/ui exists
    if [ ! -d "src/game/ui" ]; then
        echo "Directory src/game/ui does not exist. Cannot proceed with removal of src/js/ui."
    else
        # Create a backup directory for ui
        BACKUP_DIR_UI="backup_js_ui_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR_UI"

        # Copy all files from src/js/ui to the backup directory
        cp -r src/js/ui/* "$BACKUP_DIR_UI/"
        echo "Backup of ui files created in $BACKUP_DIR_UI"

        # Remove the src/js/ui directory
        rm -rf src/js/ui
        echo "Removed src/js/ui directory"
    fi
else
    echo "Directory src/js/ui does not exist. Nothing to remove."
fi

echo "Duplicate files have been removed. Backups were created if needed."
echo "The src/js/main.js file redirects to src/game/main.js for HTML compatibility."
echo "The src/js/ui files redirect to their corresponding src/game/ui files."