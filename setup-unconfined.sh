#!/bin/bash

sed -i -e 's#policy_version: 1#policy_version: 1, write_path: ["@{HOME}/"]#g' platforms/ubuntu/cordova/lib/manifest.js