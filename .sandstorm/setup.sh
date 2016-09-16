#!/bin/bash
set -euo pipefail

apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/debian wheezy/mongodb-org/3.2 main" > /etc/apt/sources.list.d/mongodb-org-3.2.list
apt-get update
apt-get install -y mongodb-org curl build-essential

curl -sL https://deb.nodesource.com/setup_4.x | bash
apt-get install -y nodejs
