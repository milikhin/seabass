#!/bin/bash

sed -i 's/var policy = { policy_groups: ['networking', 'audio'], policy_version: 1};/var policy = { policy_groups: ['networking', 'audio'], policy_version: 1, "write_path": ["@{HOME}/"] };/g platforms/ubuntu/cordova/lib/manifest.js'
