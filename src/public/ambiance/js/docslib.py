#!/usr/bin/python3
#
# Copyright 2014 Canonical Ltd
# Authors:
#   Kyle Nitzsche <kyle.nitzsche@canonical.com>
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, version 3 of the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/

import json
import subprocess
import sys

jdata=open('yuidoc.json')
data=json.load(jdata)
majver=data['majorversion']
cmd="bzr version-info | grep revno | cut -f2 -d\ "
bzrrev=p = subprocess.Popen(cmd, shell=True, stdout = subprocess.PIPE, stderr = subprocess.PIPE).communicate()[0]
bzrrev = bzrrev.decode('utf-8')
bzrrev = bzrrev.rstrip()
data['version']=majver + '~bzr' + bzrrev
with open('yuidoc.json', 'w') as f:
   json.dump(data, f, ensure_ascii=False, indent=4)
exit(0)
