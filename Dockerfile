FROM node:22

COPY ./ /DPXProject

WORKDIR /DPXProject/frontend

RUN rm -rf node_modules && npm install

WORKDIR /DPXProject/backend

RUN rm -rf node_modules && npm install

COPY ./backend/.entry.sh /.entry.sh

RUN chmod +x /.entry.sh

WORKDIR /DPXProject

ENTRYPOINT /.entry.sh
