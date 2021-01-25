#!/bin/bash

# $result replace_random($search, $replace)
#
# replace all occurrences of $replace in $search with a random number
# in the range 0-32767 using bash's built-in PRNG and return the result
replace_random()
{
    local s=$1
    local replace=$2

    # while $s ($search) contains $replace replace the first occurrence
    # of $replace with a random number.
    # quoting "$replace" forces it to be treated as a simple string
    # and not a pattern to avoid e.g. '[i]' being interpreted as a
    # character class (same holds true for '?' and '*')
    while [[ ${s} == *"${replace}"* ]]; do
        s=${s/"${replace}"/$RANDOM}
    done
    echo "${s}"
}

foo=`cat ./db.json`
bar=$(replace_random "${foo}" "XXX")

echo "$bar"
