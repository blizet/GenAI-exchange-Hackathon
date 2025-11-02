# Stage 1: Build the React frontend
FROM node:18-alpine AS build-frontend

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install

# Copy the rest of the frontend source code
COPY frontend/ ./

# Build the application
RUN yarn build

# Stage 2: Build the FastAPI backend
FROM python:3.9-slim AS build-backend

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code
COPY ./backend /app

# Copy the built frontend from the previous stage
COPY --from=build-frontend /app/frontend/build /app/static

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]