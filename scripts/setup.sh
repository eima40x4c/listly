#!/bin/bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup
print_header "🚀 Listly Development Environment Setup"

# Check for required tools
print_header "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is required but not installed. Please install Node.js 18 or higher."
    exit 1
fi
print_success "Node.js $(node --version) found"

if ! command_exists pnpm; then
    print_warning "pnpm not found. Installing pnpm..."
    npm install -g pnpm
    print_success "pnpm installed"
else
    print_success "pnpm $(pnpm --version) found"
fi

if ! command_exists docker; then
    print_warning "Docker not found. You'll need to set up a database manually."
    print_info "Install Docker from: https://docs.docker.com/get-docker/"
else
    print_success "Docker found"
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    print_success "Docker daemon is running"
fi

# Copy environment file if not exists
print_header "Setting up environment variables..."

if [ ! -f .env ]; then
    print_info "Creating .env file from .env.example..."
    cp .env.example .env
    
    # Generate NEXTAUTH_SECRET
    if command_exists openssl; then
        print_info "Generating NEXTAUTH_SECRET..."
        SECRET=$(openssl rand -base64 32)
        # Replace the placeholder in .env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|your-nextauth-secret-here-replace-this-with-random-string|$SECRET|g" .env
        else
            # Linux
            sed -i "s|your-nextauth-secret-here-replace-this-with-random-string|$SECRET|g" .env
        fi
        print_success "Generated NEXTAUTH_SECRET"
    fi
    
    print_success ".env file created"
    print_warning "Please review and update .env with your specific configuration"
else
    print_info ".env file already exists, skipping..."
fi

# Install dependencies
print_header "Installing dependencies..."
pnpm install
print_success "Dependencies installed"

# Start database with Docker
if command_exists docker; then
    print_header "Starting Docker services..."
    
    # Check if containers are already running
    if docker ps | grep -q "listly_db"; then
        print_info "Database container is already running"
    else
        print_info "Starting PostgreSQL and Redis..."
        docker-compose up -d postgres redis
        
        # Wait for database to be ready
        print_info "Waiting for database to be ready..."
        max_attempts=30
        attempt=0
        
        while [ $attempt -lt $max_attempts ]; do
            if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
                print_success "Database is ready"
                break
            fi
            attempt=$((attempt + 1))
            sleep 1
        done
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Database failed to start within 30 seconds"
            exit 1
        fi
    fi
    
    print_success "Docker services are running"
fi

# Check if Prisma schema exists before running migrations
if [ -f "prisma/schema.prisma" ]; then
    print_header "Setting up database..."
    
    # Run Prisma migrations
    print_info "Running database migrations..."
    pnpm prisma migrate dev --name init || {
        print_warning "Migration failed or skipped. This is normal if schema hasn't been created yet."
    }
    
    # Generate Prisma Client
    print_info "Generating Prisma Client..."
    pnpm prisma generate || {
        print_warning "Prisma Client generation skipped."
    }
    
    print_success "Database setup complete"
else
    print_warning "Prisma schema not found. Skipping database migrations."
    print_info "You'll need to create your Prisma schema before running migrations."
fi

# Final summary
print_header "🎉 Setup Complete!"

echo ""
print_success "Listly development environment is ready!"
echo ""
print_info "Next steps:"
echo "  1. Review and update .env with your configuration"
echo "  2. Run 'pnpm dev' to start the development server"
echo "  3. Visit http://localhost:3000"
echo ""
print_info "Useful commands:"
echo "  pnpm dev              - Start development server"
echo "  pnpm db:studio        - Open Prisma Studio (database UI)"
echo "  pnpm db:migrate       - Run database migrations"
echo "  docker-compose ps     - Check Docker containers status"
echo "  docker-compose logs   - View container logs"
echo ""
print_info "Optional development tools (run with 'docker-compose --profile tools up -d'):"
echo "  Adminer (DB UI)       - http://localhost:8080"
echo "  Redis Commander       - http://localhost:8081"
echo "  MailHog (Email test)  - http://localhost:8025"
echo ""
