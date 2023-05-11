#!/usr/bin/env bash

# https://gist.github.com/mohanpedala/1e2ff5661761d3abd0385e8223e16425
set -euxo pipefail

lokalise2 \
    --token $MY_LOKALISE_WRITE_TOKEN \
    --project-id 294027006436e9a71250c4.14064017 \
    file upload \
    --file ./public/locales/en/$NAMESPACE.json \
    --lang-iso en \
    --distinguish-by-file \
    --detect-icu-plurals