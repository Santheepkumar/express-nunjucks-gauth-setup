FROM node:15

WORKDIR /home/daruk

COPY package.json ./

COPY yarn.lock ./

RUN yarn

COPY . ./

EXPOSE 9000

CMD [ "node", "app.js" ]