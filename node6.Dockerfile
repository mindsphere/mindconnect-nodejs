# run tests in docker file 
FROM node:6.14.3-alpine

ENV HTTP_PROXY=http://10.0.75.1:8888
ENV HTTPS_PROXY=http://10.0.75.1:8888

WORKDIR /root
RUN mkdir .mc

COPY package.json ./
RUN npm install
COPY . .

CMD [ "npm", "test" ]

