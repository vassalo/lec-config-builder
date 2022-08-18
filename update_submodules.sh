git pull --recurse-submodules
git submodule init
git submodule update --remote --recursive
git config --global user.name 'Git bot'
git config --global user.email 'bot@noreply.github.com'
git remote set-url origin https://x-access-token:$GITHUB_TOKEN@github.com/$GITHUB_REPOSITORY
git commit -am "Auto updated submodule references" && git push || echo "No changes to commit"
