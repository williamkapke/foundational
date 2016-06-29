#!/usr/bin/env bash

ORIGIN=https://$GITHUB_AUTH@github.com/williamkapke/foundational.git

rm -rf ./foundational
git clone $ORIGIN --branch data --single-branch --depth=1 foundational
cd foundational

git config user.email "hubbed@kap.co"
git config user.name "Imma Bot"

npm install
node events.js

git add ./data/*

if [[ `git status -s` == '' ]]; then
  echo 'No changes';
  exit 1;
fi

echo
echo 'Committing data...'
git commit -am 'Events Update'
git push origin data
