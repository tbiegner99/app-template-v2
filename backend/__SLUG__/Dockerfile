FROM golang:1.26-alpine

# Install air for hot reloading and delve for debugging
RUN go install github.com/air-verse/air@latest && \
    go install github.com/go-delve/delve/cmd/dlv@latest

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Expose ports
EXPOSE 8080
EXPOSE 2345

# Run with air for hot reloading
CMD ["air", "-c", ".air.toml"]
