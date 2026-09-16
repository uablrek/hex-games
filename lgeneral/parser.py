#!/usr/bin/env python
# SPDX-License-Identifier: CC-BY-4.0.
# Parse LGeneral files for:
# https://github.com/uablrek/hex-games/tree/main/lgeneral
import sys
import json
import re

# LGeneral data format
# <tag        - either an object or an array item
#               Two consecutive tag's marks an array, but there are
#               exceptions!
# >           - End of a tag
# x=y         - an object item
# x=a&b&c&c   - The other way of defining an array
TAG = re.compile(r'<(\w+|#|~)')
ETAG = re.compile(r'>')
ITEM = re.compile(r'\w+=.+')
index = 0
# objtags - should not be arrays
objtags = {'players'}
ignoretags = {'result', '#', '~', 'unit_db'}
ignorekeys = {'terrain_db', 'nation_db', 'domain', 'authors', 'allied_players',
              "control", "strategy", "ai_module", "nations"}

def parse(lines, p):
    if len(lines) == 0:
        return p
    global index
    l = lines.pop(0)
    if TAG.match(l):
        k = l[1:]
        if k in ignoretags:
            parse(lines, {})
            return parse(lines, p)
        isArray = not (k in objtags) and TAG.match(lines[0])
            
        # the same tag can be used for arrays. We don't care about the
        # tag for array items, so just add an index
        if k in p:
            index = index + 1
            k = f'{k}{index}'
        v = parse(lines, {})
        if isArray:
            p[k] = list(v.values())
        else:
            p[k] = v
        return parse(lines, p)
    elif ETAG.match(l):
        return p

    # An item. Don't recurse here!
    i = l.split('=')
    addValue(p, i[0], i[1])
    while len(lines) > 0 and ITEM.match(lines[0]):
        l = lines.pop(0)
        i = l.split('=')
        addValue(p, i[0], i[1])
    return parse(lines, p)

def addValue(d, k, v):
    if k in ignorekeys:
        return
    a = v.split('&')
    if len(a) > 1:
        d[k] = a
    else:
        if isInt(v):
            d[k] = int(v)
        else:
            d[k] = v

def isInt(s):
    return s.startswith('-') and s[1:].isdigit() or s.isdigit()
            
if __name__ == '__main__':
    infile = sys.stdin
    if (len(sys.argv) > 1):
        infile = open(sys.argv[1])
    lines = infile.read().splitlines()
    if lines.pop(0) != '@':
        print("Not a LG data-file")
        sys.exit(-1)
    print(json.dumps(parse(lines, {})))
