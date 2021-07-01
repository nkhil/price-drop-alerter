FROM node:14-alpine as base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY src src
COPY swagger swagger
COPY index.js index.js
ENV PORT=8080

# test step
FROM base as test
COPY test test

# production step
FROM base as production
WORKDIR /usr/src/app
COPY --from=base usr/src/app .

EXPOSE 8080
CMD ["node", "."]
