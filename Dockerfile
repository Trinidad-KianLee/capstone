FROM node:22

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build or run commands
ENV PORT=9000

EXPOSE 9000

CMD [ "npm", "start" ]
