# 開発ステージ
FROM node:16 AS development

ENV TZ Asia/Tokyo

ARG TINI_VERSION=v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

USER node
WORKDIR /app
EXPOSE 3000

CMD ["yarn", "dev"]

# ビルドステージ
FROM development AS build
COPY src .
RUN --mount=type=secret,id=SECRETS,uid=1000 . /run/secrets/SECRETS && \
  yarn install && \
  yarn generate

# 本番ステージ
FROM httpd:2 AS production
COPY --from=build /app/out /usr/local/apache2/htdocs
