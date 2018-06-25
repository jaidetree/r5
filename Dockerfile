FROM node:alpine

VOLUME /var/app
WORKDIR /var/app
STOPSIGNAL SIGINT

RUN apk --no-cache update \
    && apk --no-cache add g++ make bash zlib-dev libpng-dev \
    &&  rm -fr /var/cache/apk/*

EXPOSE 3000
CMD ["yarn", "run", "serve"]
