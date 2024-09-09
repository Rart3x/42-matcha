
## configure the base image

FROM node:22.5.1 AS base

RUN npm install pm2 -g

RUN mkdir -p /app

WORKDIR /app

## install dependencies

FROM base AS build

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

## run the application

FROM base AS release

COPY --from=build /app/dist ./dist

RUN ls -lRa

ENV NODE_ENV=production

CMD ["pm2-runtime", "dist/server.cjs"]
