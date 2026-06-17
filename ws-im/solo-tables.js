/*
  Define "Enemy Ship Movement Table"s (ESMT) for the solo AI.  The
  variables *must* be named as in the comments below. The value must
  be an array of records with strings like:

  const soloTableSOL2 = [
    ["1-2", 'L1', 'L', 'L', 'L', 'L', 'BBB-2L'],
    ...
  ]

  The best way may be to use 'woodsolo.txt' from:
    https://boardgamegeek.com/filepage/277738/woodenship-solo-program
  alter it as you want, and convert it to JavaScript with:

  #!/usr/bin/env python
  print("const soloTableSOL2 = [")
  for l in lines:
        w = l.split()
        print(f'\t{w},')
  print("]")
*/

//const soloTableSOL1 = [...]
//const soloTableSOL2 = [...]
//const soloTableF3 = [...]
//const soloTableF4 = [...]
