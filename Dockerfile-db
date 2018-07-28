FROM postgres:10.4-alpine

VOLUME /var/lib/postgresql/data

COPY /server/schema.sql /docker-entrypoint-initdb.d/schema.sql

WORKDIR /

EXPOSE 5432
