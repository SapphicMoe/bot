FROM node:18-alpine as build

# Update Alpine
RUN apk update

# Set /app as the working directory
WORKDIR /app

# Copy metadata information
COPY ["package.json", ".yarnrc.yml", "yarn.lock", "./"]

# Copy the source code
COPY . .

# Install packages
RUN yarn install

# Build the project
RUN yarn build

FROM node:18-alpine as runtime

# Set /app as the working directory
WORKDIR /app

# Docker is stupid so I have to include this line :>
COPY --from=build ["/app/node_modules", "./node_modules"]

# Copy over the build from the last stage
COPY --from=build ["/app/dist", "./dist"]

# Execute the build
CMD ["node", "dist/src/index.js"]
