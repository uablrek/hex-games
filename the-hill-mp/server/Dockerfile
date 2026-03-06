FROM node:25.6.1-alpine
COPY --chown=0:0 bundle.cjs /
COPY --chown=0:0 html/ /html/
CMD ["node", "/bundle.cjs"]
