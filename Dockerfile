FROM node:10-alpine

VOLUME /var/app

ADD package.json yarn.lock ./

RUN yarn install
RUN yarn global add gulp

WORKDIR /var/app

EXPOSE 3000
CMD ["npx", "gulp", "serve"]
