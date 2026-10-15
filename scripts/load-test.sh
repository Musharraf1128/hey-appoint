#!/bin/bash
# Simple load generator to trigger HPA scaling.
# Usage: ./scripts/load-test.sh [service-url]
URL="${1:-http://localhost:8000/api/doctors}"
echo "Hitting $URL, Ctrl+C to stop..."
while true; do
  curl -s "$URL" > /dev/null
done
