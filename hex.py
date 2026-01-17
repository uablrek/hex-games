#!/usr/bin/env python
# SPDX-License-Identifier: CC0-1.0.
"""
Help script for creating Haxagon game maps
"""
import sys
import getopt
import argparse  # https://docs.python.org/3/library/argparse.html#module-argparse
import math
import random

dbg = lambda *arg: 0

def die(msg):
    print('ERROR: ' + msg)
    sys.exit(1)

# https://stackoverflow.com/questions/5067604/determine-function-name-from-within-that-function
# for current func name, specify 0 or no argument.
# for name of caller of current func, specify 1.
# for name of caller of caller of current func, specify 2. etc.
currentFuncName = lambda n=0: sys._getframe(n + 1).f_code.co_name
def arg_parser():
    fn = currentFuncName(1)
    prog=fn.removeprefix("cmd_")
    doc=globals()[fn].__doc__
    return argparse.ArgumentParser(prog=prog, description=doc)

# Return a SVG header with CC0 license
def svg_head(width, height, metadata=""):
    license='http://creativecommons.org/publicdomain/zero/1.0/'
    svg = f'''<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:hex="https://github.com/uablrek/hex-games"
    width="{width:.2f}" height="{height:.2f}">
<metadata>
    <rdf:RDF>
      <cc:Work rdf:about="">
        <cc:license rdf:resource="{license}" />
      </cc:Work>
    </rdf:RDF>
    {metadata}
</metadata>
'''
    return svg

# ----------------------------------------------------------------------
# Commands;

def cmd_emit_completion(args):
    """Emit bash completion for this command as an alias.
    Use "eval $(./pytemplate.py emit_completion)"
    """
    import pathlib
    parser = arg_parser()
    parser.add_argument(
        '--alias', default=pathlib.Path(__file__).stem,
        help="Alias for this command")
    args = parser.parse_args(args[1:])
    c = args.alias
    print(f"""alias {c}={__file__};
_{c}_completion() {{
  {__file__} commands $2;
}};
complete -o bashdefault -o default -C _{c}_completion {c}""")

def cmd_commands(args):
    prefix = 'cmd_'
    if len(args) > 1:
        prefix = prefix + args[1].translate(str.maketrans("-", "_"))
    cmdfn = [n for n in globals() if n.startswith(prefix)]
    for c in [x.removeprefix('cmd_') for x in cmdfn]:
        print(c.translate(str.maketrans("_", "-")))
    
def cmd_emit_grid(args):
    """Emit an svg document with a hex-grid.
    The grid is defined as an svg "pattern" and can be used to fill
    any shape (but usually a rectangle)"""
    parser = arg_parser()
    parser.add_argument(
        '--flattop', action='store_true',
        help='Flat-top grid (default is pointy-top)')
    parser.add_argument(
        '--size', default="50",
        help="hex-width for pointy-top, and hex-height for flat-top")
    parser.add_argument(
        '--scale', default="1.0",
        help="height for pointy-top, and width for flat-top")
    parser.add_argument(
        '--rect', default="640x480", help="with x height, ex 640x480")
    args = parser.parse_args(args[1:])

    # Compute the pattern path
    s = float(args.size)
    k = float(args.scale)
    d = s * math.sqrt(3) * k    # the "other" dimension
    s2 = s / 2
    d3 = d / 3
    d6 = d / 6
    if args.flattop:
        pw = d
        ph = s
        p = f'm 0 {s2:.2f} l {d3:.2f} 0 l {d6:.2f} -{s2:.2f} l {d3:.2f} 0 l {d6:.2f} {s2:.2f} l -{d6:.2f} {s2:.2f} l -{d3:.2f} 0 l -{d6:.2f} -{s2:.2f}'
    else:
        pw = s
        ph = d
        p = f'm {s2:.2f} 0 l 0 {d3:.2f} l -{s2:.2f} {d6:.2f} l 0 {d3:.2f} l {s2:.2f} {d6:.2f} l {s2:.2f} -{d6:.2f} l 0 -{d3:.2f} l -{s2:.2f} -{d6:.2f}'

    # Construct the svg
    rdim = args.rect.split('x')
    width = float(rdim[0])
    height = float(rdim[1])
    # preserve "scale" in the image!
    svg = svg_head(width, height, metadata=f'<hex:params scale="{args.scale}" />')
    svg += f'''<pattern
    id="Hex" width="{pw:.2f}" height="{ph:.2f}" patternUnits="userSpaceOnUse">
      <path fill="none" stroke="black" stroke-width="1"
        d="{p}" />
</pattern>
<rect x="0" y="0" fill="url(#Hex)" stroke="black" width="{width:.2f}" height="{height:.2f}" stroke-width="1" />
</svg>'''
    print(svg)
    return 0

def cmd_svg_data(args):
    """Emit svg image as JavaScript string.
    Whitespaces are compressed to a single space, double-quotes and
    url-chars are escaped, and the string is pre-pended with
    "data:image/svg+xml,"
    """
    parser = arg_parser()
    parser.add_argument(
        '--file', default="", help="File to read (default stdin)")
    args = parser.parse_args(args[1:])
    if args.file:
        with open(args.file, 'r') as file:
            data = file.read()
    else:
        data = sys.stdin.read()

    # compress whitespace
    data = ' '.join(data.split())
    # escape url characters (e.g. '#'). (I am not happy with this)
    import urllib.parse
    data = urllib.parse.quote(data, safe='"<> =()/:')
    # escape '"'
    data = data.replace('"', '\\"')
    # The first '/' must be escaped, or it will magically be transformed to '.'
    # Why is this happening???
    print("data:image\\/svg+xml," + data)
    return 0

def cmd_dice(args):
    """Roll dice.
    Prints random numbers
    """
    parser = arg_parser()
    parser.add_argument(
        '--dice', default="1d6", help='Type of dice, e.g "2d12"')
    args = parser.parse_args(args[1:])
    s = args.dice.split('d')
    n = int(s[0])
    d = 6
    if len(s) > 1:
        d = int(s[1])
    if n < 2:
        print(random.randint(1, d))
    else:
        sum = 0
        str = ''
        for i in range(n):
            r = random.randint(1, d)
            sum = sum + r
            str += f'{r} '
        str += f'= {sum}' 
        print(str)
    return 0
    
# ----------------------------------------------------------------------
# Parse args

def parse_args():
    cmdfn = [n for n in globals() if n.startswith('cmd_')]
    cmds = [x.removeprefix('cmd_') for x in cmdfn]

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('-v', action='count', default=0, help="verbose")
    parser.add_argument('cmd', choices=cmds, nargs=argparse.REMAINDER)
    args = parser.parse_args()

    global dbg
    if args.v:
        dbg = getattr(__builtins__, 'print')
    dbg("Program starting", args, cmds)

    # Why is this necessary? Bug?
    if not args.cmd:
        #parser.print_help()   (this works, but doesn't look good)
        print(__doc__)          # (unformatted)
        print("Sub-commands:")
        for c in cmds:
            doc = globals()["cmd_"+c].__doc__
            if not doc:
                continue
            print("  ", c.translate(str.maketrans("_", "-")))
            print("    ", doc.splitlines()[0])  # (only first line)
        sys.exit(0)

    # accept both '_' and '-' in command names
    cmd = args.cmd[0].translate(str.maketrans("-", "_"))
    if cmd not in cmds:
        print("Invalid command")
        sys.exit(1)

    # accept both '_' and '-' in command names
    cmd_function = globals()["cmd_" + cmd]
    sys.exit(cmd_function(args.cmd))

if __name__ == '__main__':
    parse_args()
