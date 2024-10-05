# Step 1: Use Node.js base image
FROM node:20

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Step 4: Install Node.js dependencies
RUN npm install --production

# Step 5: Copy the rest of your application code to the container
COPY . .

# Step 6: Build the Remix app
RUN npm run build

# Step 7: Expose the port the app will run on (usually 3000 for Remix apps)
EXPOSE 3000

# Step 8: Start the Remix app
CMD ["npm", "start"]
