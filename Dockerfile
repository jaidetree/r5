FROM node:10-alpine

ADD package.json yarn.lock ./

RUN yarn install

VOLUME /var/app

WORKDIR /var/app
