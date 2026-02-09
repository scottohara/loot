# syntax=docker/dockerfile:1

ARG NODE_VERSION=error-version-not-specified
ARG RUBY_VERSION=error-version-not-specified

### Frontend ###

FROM node:${NODE_VERSION}-alpine AS frontend

ARG NPM_VERSION
RUN --mount=type=cache,id=loot-npm,target=/root/.npm \
	npm install --global npm@$NPM_VERSION

WORKDIR /build

COPY --link package*.json ./

RUN --mount=type=cache,id=loot-npm,target=/root/.npm \
	npm ci

COPY --link \
	tsconfig.json \
	webpack.common.js \
	webpack.prod.js ./

COPY --link src src/

RUN npm run build

### Backend ###

FROM ruby:${RUBY_VERSION}-alpine AS backend

RUN apk add --no-cache \
	build-base \
	yaml-dev

WORKDIR /build
ENV RACK_ENV=production

COPY --link \
	.tool-versions \
	Gemfile* ./

RUN --mount=type=cache,id=loot-bundler,target=tmp/vendor/bundle \
	bundle config set --local without development:test && \
	bundle config set --local deployment true && \
	bundle config set --local clean true &&\
	bundle config set --local path tmp/vendor/bundle && \
	bundle install --jobs=4 && \
	cp -a tmp/vendor ./;

### App ###

FROM ruby:${RUBY_VERSION}-alpine AS app

RUN apk add --no-cache \
	libpq \
	tzdata; \
	adduser --system --uid 100 loot

USER loot
WORKDIR /loot
ENV RACK_ENV=production
ENV RAILS_ENV=production
ENV TZ=Australia/Sydney

RUN \
	bundle config set --local without development:test && \
	bundle config set --local deployment true;

COPY --link --chown=100 \
	.tool-versions \
	config.ru \
	Gemfile* \
	Rakefile ./

COPY --link --chown=100 db db/
COPY --link --chown=100 config config/
COPY --link --chown=100 app app/
COPY --link --chown=100 --from=backend build/vendor/bundle vendor/bundle/
COPY --link --chown=100 --from=frontend build/public public/

EXPOSE 3000

CMD ["bundle", "exec", "puma"]

HEALTHCHECK NONE