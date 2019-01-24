# Copyright (C), Siemens AG 2017
# run tests in docker file 
FROM node:latest

WORKDIR /usr/src/app

COPY PACKAGE *.json ./

RUN npm install

COPY . .

CMD ["npm" "test"]

