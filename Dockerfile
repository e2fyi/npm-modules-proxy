FROM node:12-alpine as build

WORKDIR /app

COPY *.json /app/
COPY src src
RUN npm i --dev && npm run build

###############################
FROM node:12-alpine as dist

WORKDIR /app

ENV PORT=80
ENV CACHE_DIR=.caches
# 1 day
ENV CACHE_MAX_AGE=86400

COPY --from=build /app/*.json /app/
COPY --from=build /app/dist dist

RUN npm i --production
CMD node dist/index.js