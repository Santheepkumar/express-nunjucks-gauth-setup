FROM node:14 AS base

WORKDIR /home/daruk

COPY src/package.json ./

COPY src/yarn.lock ./

# Build stage to install dev dependencies & build css
FROM base AS build

RUN yarn

COPY src ./

RUN yarn prod:build-css

# Copy from base stage, install prod dependencies and copy built css from build stage
FROM base

RUN yarn install --production

COPY src ./

COPY --from=build /home/daruk/public/style.css /home/daruk/public/

# Run app.js at port 9000
EXPOSE 9000

CMD [ "node", "app.js" ]
