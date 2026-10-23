#!/bin/sh
# usage: contact_sheet.sh in.mp4 out.png  -> 24 evenly spaced frames, 6x4 grid
IN="$1"; OUT="$2"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
ffmpeg -v error -y -i "$IN" -vf "select='not(mod(n\,$(python3 -c "import math;print(max(1,int(float('$D')*30/24)))")))',scale=270:480,tile=6x4" -frames:v 1 -vsync 0 "$OUT"
