#! /bin/sh
if test -n "$SC_USER"; then
	cp $SC_USER ./sc-user.js
else
	cp $src/scenarios/sc-user.js .
fi
cp $src/solo-tables.js .

