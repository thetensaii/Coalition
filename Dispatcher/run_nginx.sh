#!/usr/bin/env bash
envsubst < default.conf.template > /etc/nginx/sites-enabled/default

nginx
