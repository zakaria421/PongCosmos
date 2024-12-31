# Use an official Nginx image
FROM nginx:latest

# Copy the Nginx configuration file to the container
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY nginx.crt /etc/nginx/ssl/certificate.crt
COPY nginx.key /etc/nginx/ssl/private.key

RUN chmod 600 /etc/nginx/ssl/certificate.crt /etc/nginx/ssl/private.key

RUN chmod -R 755 /usr/share/nginx/html

# Copy the content of the current directory to the default Nginx directory
COPY . /usr/share/nginx/html

# Expose port 80 to make your application accessible
EXPOSE 80 8443
