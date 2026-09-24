FROM node:22.14-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
ENV npm_config_ignore_scripts=true
RUN npm ci
ENV npm_config_ignore_scripts=

COPY . .

EXPOSE 5173

ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
