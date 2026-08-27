FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# App port + Node debug inspector port
EXPOSE 8080
EXPOSE 9229

CMD ["npm", "run", "dev"]
