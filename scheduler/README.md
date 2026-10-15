# Scheduled runs

Nothing here is installed. The plist is a template, and autopublish is `off` in the database. Until you change both, nothing runs on its own and nothing is posted without you.

## What a scheduled run does

`run.sh` runs once a day:

1. `node paper-reels/bin/health.mjs --backup` writes `data/backups/content-YYYY-MM-DD.sqlite` (keeps the newest 14) and checks the database, ffmpeg, disk, Claude CLI, YouTube and Meta tokens and Cloudinary config.
2. `node paper-reels/bin/pipeline.mjs` runs health again, takes the oldest queued link, and runs `/make-reel <url>` in a headless Claude Code session from `content-creation/` (so `.claude/agents/` load). Publishing is blocked inside that session. When it ends, the runner calls `reels autopublish <id>` in a separate process.

One link per day. Add links with:

    node paper-reels/bin/reels.mjs queue add https://arxiv.org/abs/XXXX.XXXXX
    node paper-reels/bin/reels.mjs queue list

## Install

Try it by hand first and read the log:

    cd ~/Documents/Developer/content-creation
    node paper-reels/bin/pipeline.mjs --dry-run      # prints the commands, claims nothing
    node paper-reels/bin/health.mjs
    node paper-reels/bin/pipeline.mjs                # one real run, in the foreground

Then:

    mkdir -p data/logs
    cp scheduler/com.hemanth.reels.plist ~/Library/LaunchAgents/
    plutil -replace StartCalendarInterval.Hour -integer 6 ~/Library/LaunchAgents/com.hemanth.reels.plist   # optional: run at 06:00 instead of 09:00
    launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.hemanth.reels.plist
    launchctl print gui/$UID/com.hemanth.reels | head -20     # confirm it is loaded
    launchctl kickstart gui/$UID/com.hemanth.reels             # optional: run once now

Remove it:

    launchctl bootout gui/$UID/com.hemanth.reels
    rm ~/Library/LaunchAgents/com.hemanth.reels.plist

After `kickstart`, check that `data/logs/launchd.log` and `data/logs/scheduler.log` appeared and that `launchctl print gui/$UID/com.hemanth.reels` shows `last exit code = 0`. The project lives under `~/Documents`, which macOS privacy protection can hide from background jobs. If the logs are missing or the exit code is non-zero with no output, give Full Disk Access to `/bin/zsh` and `/opt/homebrew/bin/node` (System Settings, Privacy and Security) and kickstart again. Also confirm the `claude` login works from launchd: the pipeline log should show the session starting, not an auth error.

If the Mac is asleep at the scheduled time, launchd runs the job when it wakes. If it is off, that day is skipped.

## Autopublish

Off by default. With it off, every run stops at `needs_review` and you get a "ready for review" notification. You then look at the video and post with `reels publish <id>` as before.

    node paper-reels/bin/reels.mjs settings                       # show all settings
    node paper-reels/bin/reels.mjs settings set autopublish on     # turn on
    node paper-reels/bin/reels.mjs settings set autopublish off    # turn off
    node paper-reels/bin/reels.mjs autopublish <id> --dry-run      # what it would decide for one item, posts nothing

Turning it on also means changing the Publishing rule in `llm-wiki/AGENTS.md`, which still says a human approves every post.

`autopublish` posts only when all of these hold, and otherwise lists every one that failed:

- setting `autopublish` is `on`
- `validation.json` says PASS and its video and thumbnail sha256 match the registered files (the same gate `reels publish` uses)
- the latest `critic` review is PASS, with a score at or above `min_critic_score` (default 7), recorded against the current video's sha256
- the latest `facts` review is PASS, recorded against the current video's sha256
- post text exists for each platform in `publish_platforms` (default `youtube,instagram`)
- none of those platforms already has a SUCCESS post for the item

Other settings: `max_attempts` (default 2) is how many runs a link gets before it is marked `failed`.

## When something fails

Every failure sends a macOS notification and appends a line to `data/logs/notifications.log`. Full run logs are `data/logs/pipeline-<timestamp>.log` (Claude's session as stream-json, then the autopublish output). `data/logs/scheduler.log` has the health tables.

- Health check fails: the run stops before claiming a link. Nothing changes in the queue.
- Claude exits non-zero, times out (60 min), or no episode was registered: the link goes back to `queued` if it has attempts left, otherwise `failed`. Retry by hand with `reels queue retry <id>`.
- Autopublish refuses: the link is `needs_review` with the reasons in its `error` column (`reels queue list`).
- An upload fails: the link is `needs_review`; check `reels show <id>`. If one platform went live and the other failed, autopublish will keep refusing (one platform already has a SUCCESS post). Finish it by hand: `reels publish <id> --platforms instagram`.

## The YouTube token expires every 7 days

The Google OAuth consent screen for the uploader is in **Testing**. In that mode Google expires the refresh token 7 days after you authorize, and every scheduled run that needs YouTube will fail until you re-run `node uploader/scripts/youtube_auth.js`. `health.mjs` estimates the days left from `youtube_tokens.json` and warns under 2 days. The fix is to set the consent screen to **In production** in Google Cloud Console (APIs and Services, OAuth consent screen, Publish app). Do that before you rely on the schedule.

With autopublish off, an expired token is only a warning, since runs then only produce and validate. With autopublish on it fails the health check and the run does not start.
