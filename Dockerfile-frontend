FROM node:8.11-alpine

RUN npm install -g http-server grunt-cli

RUN mkdir /estimator

COPY /client /estimator/client

WORKDIR /estimator/client

RUN npm install && npm install grunt

WORKDIR /estimator/client

RUN grunt less && grunt autoprefixer && grunt jade

EXPOSE 80

CMD ['http-server']
