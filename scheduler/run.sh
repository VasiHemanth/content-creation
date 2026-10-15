#!/bin/zsh
# What launchd runs once a day: backup + health, then one pipeline run (one queued link).
# pipeline.mjs runs the health check again and aborts with a notification if anything critical fails.
set -u
CC="${0:A:h:h}"
cd "$CC" || exit 1
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
mkdir -p data/logs
echo "=== $(date '+%Y-%m-%d %H:%M:%S') scheduled run ===" >> data/logs/scheduler.log
node paper-reels/bin/health.mjs --backup >> data/logs/scheduler.log 2>&1
node paper-reels/bin/pipeline.mjs >> data/logs/scheduler.log 2>&1
