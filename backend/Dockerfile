FROM node:16

ENV TZ Asia/Tokyo

ARG TINI_VERSION=v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

USER node
WORKDIR /app

EXPOSE 3000

CMD ["yarn", "dev"]
