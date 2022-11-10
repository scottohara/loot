# syntax=docker/dockerfile:1

ARG NODE_VERSION
ARG RUBY_VERSION

### Frontend ###

FROM node:${NODE_VERSION}-alpine as frontend

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

FROM ruby:${RUBY_VERSION}-alpine as backend

RUN apk add --no-cache \
	build-base \
	postgresql-dev

WORKDIR /build
ENV RACK_ENV=production

COPY --link Gemfile* ./

RUN --mount=type=cache,id=loot-bundler,target=tmp/vendor/bundle \
	bundle config set --local without development:test; \
	bundle config set --local deployment true; \
	bundle config set --local clean true;\
	bundle config set --local path tmp/vendor/bundle; \
	bundle install --jobs=4; \
	cp -a tmp/vendor ./;

### App ###

FROM ruby:${RUBY_VERSION}-alpine as app

RUN \
	fallocate -l 512M /swapfile; \
	chmod 0600 /swapfile; \
	mkswap /swapfile; \
	sysctl --write vm.swappiness=10; \
	swapon /swapfile;

RUN apk add --no-cache \
	libpq \
	tzdata

RUN adduser --system loot
USER loot
WORKDIR /loot
ENV RACK_ENV=production
ENV RAILS_ENV=production
ENV RAILS_LOG_TO_STDOUT=true
ENV RAILS_SERVE_STATIC_FILES=true
ENV TZ=Australia/Sydney

RUN \
	bundle config set --local without development:test; \
	bundle config set --local deployment true;

RUN mkdir -p tmp/pids

COPY --link --chown=loot \
	config.ru \
	Gemfile* \
	Rakefile ./

COPY --link --chown=loot db db/
COPY --link --chown=loot config config/
COPY --link --chown=loot app app/
COPY --link --chown=loot --from=backend build/vendor/bundle vendor/bundle/
COPY --link --chown=loot --from=frontend build/public public/

EXPOSE 3000

CMD ["bundle", "exec", "puma"]