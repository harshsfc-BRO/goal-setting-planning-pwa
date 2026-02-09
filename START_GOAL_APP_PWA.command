#!/bin/zsh
cd "/Users/aflatoon/Desktop/untitled folder/GOAL SETTING AND PLANNING " || exit 1
echo "Starting Goal Setting app in PWA install mode..."
echo "Please keep this Terminal window open while using the app."
echo ""
npm run build || exit 1
(sleep 3; open "http://localhost:3000") &
npm run start
