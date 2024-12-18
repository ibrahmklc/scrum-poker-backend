FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y git

RUN git clone https://github.com/ibrahmklc/scrum-poker-web.git

RUN npm install --production

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
