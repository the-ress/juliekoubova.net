#!/bin/sh

set -e

GIT_DIR=build.git
WORK_TREE=build
REMOTE=https://git.juliekoubova.net/wwwroot.git

if [ ! -d $WORK_TREE ]; then
      mkdir $WORK_TREE
fi

if [ ! -d $GIT_DIR ]; then
      git --git-dir=$GIT_DIR --work-tree=$WORK_TREE init
      git --git-dir=$GIT_DIR --work-tree=$WORK_TREE remote add deploy $REMOTE
      git --git-dir=$GIT_DIR --work-tree=$WORK_TREE fetch deploy
      git --git-dir=$GIT_DIR --work-tree=$WORK_TREE reset --hard deploy/master
fi

node build.js

git --git-dir=$GIT_DIR --work-tree=$WORK_TREE add --all
git --git-dir=$GIT_DIR --work-tree=$WORK_TREE commit --m deploy
git --git-dir=$GIT_DIR --work-tree=$WORK_TREE push deploy master