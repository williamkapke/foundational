#!/usr/bin/env bash

ORIGIN=https://$GITHUB_AUTH@github.com/williamkapke/foundational.git

rm -rf ./foundational
git clone $ORIGIN --branch data --single-branch --depth=1 foundational
cd foundational

git config user.email "hubbed@kap.co"
git config user.name "Imma Bot"

npm install
if [[ $DATE == 'yesterday' ]]; then
  DATE=$(node -e 'd = new Date();d.setHours(-24);console.log(d.toISOString().substr(0,10))')
fi
node summarize.js $DATE

git add ./data/**/*.*

if [[ `git status -s` == '' ]]; then
  echo 'No changes';
  exit 1;
fi

echo
echo 'Committing data...'
git commit -am "Summarize $DATE"
git push origin data
