#!/bin/bash
docker-compose --env-file .env down --rmi all --remove-orphans
