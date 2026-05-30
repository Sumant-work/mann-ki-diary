#!/bin/zsh
cd "$(dirname "$0")"
URL="http://localhost:4179/"

echo "Starting Mann Ki Diary preview..."
echo "Keep this Terminal window open while previewing."
echo "Opening: $URL"

(sleep 1 && open "$URL") &
python3 -m http.server 4179 --bind 127.0.0.1
