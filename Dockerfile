FROM node:17

RUN apt-get update && \
  apt-get install -y libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 \
  libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev libxss-dev libasound2

RUN mkdir service
WORKDIR /service

COPY package.json .
COPY package-lock.json .
RUN npm install --production

COPY src src

CMD ["node", "src/server.js"]