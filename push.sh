 rsync -avzr --exclude="push.sh"  --exclude="package-lock.json" --exclude="config.js" --exclude="app.js" --exclude="node_modules" --exclude=".git"  ./ qqgo:/data/explorer/
