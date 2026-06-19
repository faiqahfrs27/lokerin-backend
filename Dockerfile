FROM node:22-slim

RUN apt-get update -y \
    && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "npx prisma generate && npm run build && npm run db:deploy && npm run start"]