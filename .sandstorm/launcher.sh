#!/bin/bash
set -euo pipefail

DBPATH=/var/mongo
mkdir -p $DBPATH
mongod --fork --port 27017 --dbpath $DBPATH --noauth --bind_ip 127.0.0.1 --nohttpinterface  --storageEngine wiredTiger --wiredTigerEngineConfigString 'log=(prealloc=false,file_max=200KB)' --wiredTigerCacheSizeGB 1 --logpath $DBPATH/mongo.log


cd /opt/app
npm start
exit 0
