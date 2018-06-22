FROM node:alpine

VOLUME /var/app

ADD package.json yarn.lock ./

RUN yarn install

WORKDIR /var/app

STOPSIGNAL SIGINT

EXPOSE 3000
CMD ["/node_modules/.bin/gulp", "serve"]
