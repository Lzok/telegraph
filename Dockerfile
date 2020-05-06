FROM node:12.16.3-alpine

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# default to port 3000 for node, and 9229 and 9230 (tests) for debug
ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT 9229 9230

RUN npm i npm@latest -g

WORKDIR /usr/src/app

RUN chown node:node /usr/src/app

USER node
COPY package.json package-lock.json* ./

RUN if [ "$NODE_ENV" = "development" ]; \
	then npm install;  \
	else npm install --production; \
	fi

ENV PATH /usr/src/app/node_modules/.bin:$PATH

# copy in our source code last, as it changes the most
COPY . .

ENTRYPOINT ["./docker-entrypoint.sh"]
