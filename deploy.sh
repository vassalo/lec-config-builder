#!/usr/bin/env sh

set -e
npm install
npm run build
cd dist
git init
git checkout -b main
git add -A
git config --global user.name "dzou"
git config --global user.email "dzou@company.com"
git commit -m 'deploy'
git push -f git@github.com:vassalo/lec-config-builder.git main:gh-pages
cd -
