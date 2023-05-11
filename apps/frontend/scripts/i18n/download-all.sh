#!/usr/bin/env bash

# https://gist.github.com/mohanpedala/1e2ff5661761d3abd0385e8223e16425
set -euxo pipefail

lokalise2 \
    --token $MY_LOKALISE_READ_TOKEN \
    --project-id 294027006436e9a71250c4.14064017 \
    file download \
    --unzip-to ./public/locales \
    --add-newline-eof \
    --export-empty-as skip \
    --export-sort a_z \
    --format json \
    --indentation 4sp \
    --placeholder-format i18n \
    --plural-format i18next_v4
