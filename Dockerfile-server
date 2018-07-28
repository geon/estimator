FROM node:4-alpine

RUN mkdir /estimator

COPY /server /estimator/server

WORKDIR /estimator/server

RUN sed -in 's/username:password@localhost/postgres:postgres@db/' config.json

RUN cat config.json

RUN npm install -g yarn

RUN yarn install

EXPOSE 3000

CMD ['node', './bin/www']
