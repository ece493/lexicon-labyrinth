# based off of template from https://github.com/docker/awesome-compose/blob/master/react-express-mongodb/frontend/Dockerfile
# Create image based on the official Node image from dockerhub
FROM node:lts-buster

WORKDIR /usr/src/app

# Copy dependency definitions
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

COPY . /usr/src/app

# Install dependecies
# https://github.com/facebook/create-react-app/issues/508
RUN npm set progress=false \
    && npm config set depth 0 \
    && npm i install \
    && npm install react-scripts --save
# RUN npm i install
COPY . /usr/src/app
EXPOSE 3000

# Serve the app
CMD ["npm", "run", "start"]