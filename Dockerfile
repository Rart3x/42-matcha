
## configure the base image

FROM node:22-alpine AS base

RUN npm install pm2 -g

RUN mkdir -p /app
WORKDIR /app

## install dependencies

FROM base AS dependencies

COPY package.json package-lock.json ./
RUN npm install --production

## build the application

FROM dependencies AS build

COPY . .

RUN npm run build

## run the application

FROM base AS release

COPY --from=dependencies /app/node_modules ./node_modules

COPY --from=build /app/dist ./dist

COPY ecosystem.config.js .

RUN ls -lRa

CMD ["pm2-runtime", "ecosystem.config.js"]
