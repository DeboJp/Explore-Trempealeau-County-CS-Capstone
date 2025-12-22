#!/usr/bin/env bash
set -e

# From routing-backend/osrm/

# Ensure Docker is running, then:
docker pull osrm/osrm-backend

# Run OSRM "routed" server against the local region.osrm
# - maps container port 5000 → host port 4000
# - binds current folder as /data inside the container
docker run --rm -t -i \
  -p 4000:5000 \
  -v "$(pwd)":/data \
  osrm/osrm-backend \
  osrm-routed /data/region.osrm
