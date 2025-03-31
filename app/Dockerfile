FROM node:21.6.2
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

RUN apt update
RUN apt-get upgrade -y
RUN apt-get install -y wget
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \ 
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
RUN apt-get update && apt-get -y install google-chrome-stable
RUN apt update

EXPOSE 4000
CMD ["npm", "run", "dev"]
