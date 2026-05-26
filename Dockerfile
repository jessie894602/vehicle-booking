FROM artifactory.chehejia.com/licloud-docker/base/run/node:22.13-bullseye-slim-artifactory

WORKDIR /app

ENV NODE_ENV=production \
    NPM_CONFIG_REGISTRY=https://artifactory.ep.chehejia.com/artifactory/api/npm/licloud-npm/

COPY package*.json ./

RUN npm install --production

COPY . .

RUN mkdir -p /app/data

RUN groupadd -g 1000 appuser && \
    useradd -m -u 1000 -g appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

CMD ["npm", "start"]
