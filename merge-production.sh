#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Fetch the latest changes from the remote repository
git fetch origin

# Check out the main branch and pull the latest changes
git checkout main
git pull origin main

# Check out the production branch and pull the latest changes
git checkout production
git pull origin production

# Merge the main branch into the production branch
git merge main

# Push the updated production branch to GitHub
git push origin production

echo "Successfully merged main into production and pushed to GitHub."