#!/bin/sh

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ]; then
  echo "Usage: $0 <user> <password> <host> <db>"
  exit 1
fi

rm -rf data
mkdir -p data

echo 'Exporting from remote database...'
docker run -v $PWD/../data:/dump -e POSTGRES_PASSWORD=password -e PGPASSWORD=$2 postgres:15.8-alpine pg_dump -h ${3} -p 5432 -U $1 -d $4 --column-inserts -t "public.\"AnalyticsSeries\"" -t "public.\"AnalyticsDimension\"" -t "public.\"AnalyticsSeries_AnalyticsDimension\"" -f /dump/dump.sql
