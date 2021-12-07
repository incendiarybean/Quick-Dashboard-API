#BUILD
FROM node:slim as build
ENV NODE_ENV=production

WORKDIR /quick-dashboard-api
ENV PATH /quick-dashboard-api/node_modules/.bin:$PATH

COPY ./package.json ./
# COPY ./package-lock.json ./
COPY ./run.sh ./

COPY . .

#PROD
FROM node:slim
WORKDIR /quick-dashboard-api

COPY --from=build quick-dashboard-api/run.sh /quick-dashboard-api/run.sh
COPY --from=build quick-dashboard-api/package.json /quick-dashboard-api/package.json
COPY --from=build quick-dashboard-api/api /quick-dashboard-api/api
COPY --from=build quick-dashboard-api/src /quick-dashboard-api/src

COPY . ./

RUN ["chmod", "+x", "./run.sh"]
CMD [ "./run.sh" ]
