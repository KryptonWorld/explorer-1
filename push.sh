rsync -avzr --exclude="push.sh"  --exclude="package-lock.json" --exclude="config.js" --exclude="app.js" --exclude="node_modules" --exclude=".git"  ./ nnserver:/data/explorer-1/
ssh nnserver "pm2 restart app"

