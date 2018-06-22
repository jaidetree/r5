FROM node:alpine

VOLUME /var/app
WORKDIR /var/app
STOPSIGNAL SIGINT

EXPOSE 3000
CMD ["yarn", "run", "serve"]
