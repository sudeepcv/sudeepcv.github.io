FROM node:18-alpine
WORKDIR /workspace
RUN npm install -g browser-sync
EXPOSE 3000 35729
CMD ["browser-sync", "start", "--server", "--files", "./", "--port", "3000", "--no-open", "--reload-delay", "200"]
