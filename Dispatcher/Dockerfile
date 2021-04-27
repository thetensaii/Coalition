FROM ubuntu:21.04
RUN apt-get update \
    && apt-get install -y nginx \
    && apt-get -y install gettext-base \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && echo "daemon off;" >> /etc/nginx/nginx.conf
WORKDIR /usr/src/app
COPY . .
EXPOSE 80
CMD ["sh","run_nginx.sh"]
