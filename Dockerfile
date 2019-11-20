# Base image
# FROM node:alpine

# A Puppeteer Docker image based on Puppeteer’s own recommendations 
# https://hub.docker.com/r/buildkite/puppeteer
FROM buildkite/puppeteer

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm install --production --silent
COPY . ./

# run app
RUN npm run start

