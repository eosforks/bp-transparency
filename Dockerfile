FROM node:8.9.1-alpine

# Create app dir
RUN mkdir -p /app
WORKDIR /app

# Install deps
RUN apk update && apk upgrade && apk add git
COPY package*.json /app/
RUN npm install

ENV HOME /app

# If building for production:
# RUN npm install --only=production
COPY . /app/

ENV HOST 0.0.0.0
EXPOSE 3000

# Start command
CMD [ "npm", "run", "dev" ]