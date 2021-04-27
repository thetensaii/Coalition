#!/bin/bash
docker-compose --env-file .env build
docker-compose --env-file .env up -d
