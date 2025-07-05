#!/bin/bash

# Vercel Frontend Deployment Script
# This script helps deploy the frontend to Vercel

set -e

echo "🚀 Starting Vercel Frontend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    print_error "frontend/package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to frontend directory
print_status "Navigating to frontend directory..."
cd frontend

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    print_error "vercel.json not found in frontend directory."
    exit 1
fi

# Check if user is logged in to Vercel
print_status "Checking Vercel login status..."
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please log in..."
    vercel login
fi

# Get backend URL from user
echo ""
print_status "Please provide your backend URL:"
echo "Examples:"
echo "  - Railway: https://your-app.up.railway.app"
echo "  - Vercel: https://your-backend.vercel.app"
echo "  - Heroku: https://your-app.herokuapp.com"
echo ""
read -p "Enter your backend URL: " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    print_error "Backend URL is required."
    exit 1
fi

# Remove trailing slash if present
BACKEND_URL=$(echo "$BACKEND_URL" | sed 's/\/$//')

print_status "Backend URL set to: $BACKEND_URL"

# Deploy to Vercel
print_status "Deploying to Vercel..."
echo ""

# Set environment variable
print_status "Setting environment variable VITE_API_BASE_URL..."
echo "$BACKEND_URL" | vercel env add VITE_API_BASE_URL production

# Deploy
print_status "Starting deployment..."
vercel --prod --yes

print_success "Deployment completed!"
echo ""
print_status "Your frontend should now be available at the URL shown above."
print_status "Make sure your backend CORS settings allow requests from your Vercel domain."
echo ""
print_status "To check deployment status:"
echo "  vercel ls"
echo ""
print_status "To view logs:"
echo "  vercel logs"
echo ""
print_status "To redeploy:"
echo "  cd frontend && vercel --prod" 