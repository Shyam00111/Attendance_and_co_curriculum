#!/bin/bash

# Complete Deployment Script
# This script automates the entire deployment process

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="attendance-app"
AWS_REGION="us-east-1"
ENVIRONMENT="prod"
CLUSTER_NAME="attendance-cluster"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Attendance App Deployment Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to print section headers
print_header() {
    echo -e "${BLUE}>>> $1${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
print_header "Checking Prerequisites"

command -v terraform >/dev/null 2>&1 || { print_error "Terraform not found"; exit 1; }
command -v aws >/dev/null 2>&1 || { print_error "AWS CLI not found"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { print_error "kubectl not found"; exit 1; }
command -v docker >/dev/null 2>&1 || { print_error "Docker not found"; exit 1; }

print_success "All prerequisites found"

# Build Docker images
print_header "Building Docker Images"

echo "Building backend image..."
docker build -t ${PROJECT_NAME}-backend:latest -f backend/Dockerfile backend/
print_success "Backend image built"

echo "Building frontend image..."
docker build -t ${PROJECT_NAME}-frontend:latest -f frontend/Dockerfile frontend/
print_success "Frontend image built"

# Tag images for ECR
print_header "Tagging Images for ECR"

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

docker tag ${PROJECT_NAME}-backend:latest ${ECR_REGISTRY}/${PROJECT_NAME}-backend:latest
docker tag ${PROJECT_NAME}-frontend:latest ${ECR_REGISTRY}/${PROJECT_NAME}-frontend:latest

print_success "Images tagged for ECR"

# Push images to ECR
print_header "Pushing Images to ECR"

echo "Authenticating with ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

echo "Pushing backend image..."
docker push ${ECR_REGISTRY}/${PROJECT_NAME}-backend:latest
print_success "Backend image pushed"

echo "Pushing frontend image..."
docker push ${ECR_REGISTRY}/${PROJECT_NAME}-frontend:latest
print_success "Frontend image pushed"

# Apply Terraform
print_header "Deploying Infrastructure with Terraform"

cd terraform

echo "Initializing Terraform..."
terraform init

echo "Planning Terraform deployment..."
terraform plan -out=tfplan \
  -var="aws_region=${AWS_REGION}" \
  -var="environment=${ENVIRONMENT}"

read -p "Do you want to proceed with Terraform apply? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Applying Terraform..."
    terraform apply tfplan
    
    echo "Saving outputs..."
    terraform output -json > outputs.json
    print_success "Infrastructure deployed"
else
    print_error "Terraform apply cancelled"
    exit 1
fi

cd ..

# Configure kubectl
print_header "Configuring kubectl"

echo "Updating kubeconfig..."
aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_REGION}
print_success "kubectl configured"

# Deploy to Kubernetes
print_header "Deploying to Kubernetes"

echo "Creating production namespace..."
kubectl create namespace production --dry-run=client -o yaml | kubectl apply -f -
print_success "Namespace created"

echo "Creating secrets..."
read -sp "Enter JWT Secret: " JWT_SECRET
echo
kubectl create secret generic app-secrets \
  --from-literal=JWT_SECRET="${JWT_SECRET}" \
  -n production --dry-run=client -o yaml | kubectl apply -f -
print_success "Secrets created"

echo "Updating Kubernetes manifests..."
sed -i "s|BACKEND_IMAGE|${ECR_REGISTRY}/${PROJECT_NAME}-backend:latest|g" kubernetes/backend-deployment.yaml
sed -i "s|FRONTEND_IMAGE|${ECR_REGISTRY}/${PROJECT_NAME}-frontend:latest|g" kubernetes/frontend-deployment.yaml

echo "Deploying backend..."
kubectl apply -f kubernetes/backend-deployment.yaml -n production
print_success "Backend deployed"

echo "Deploying frontend..."
kubectl apply -f kubernetes/frontend-deployment.yaml -n production
print_success "Frontend deployed"

echo "Deploying ingress and policies..."
kubectl apply -f kubernetes/ingress-and-policies.yaml -n production
print_success "Ingress and policies deployed"

# Wait for deployments
print_header "Waiting for Deployments"

echo "Waiting for backend deployment..."
kubectl rollout status deployment/attendance-backend -n production --timeout=5m
print_success "Backend deployment ready"

echo "Waiting for frontend deployment..."
kubectl rollout status deployment/attendance-frontend -n production --timeout=5m
print_success "Frontend deployment ready"

# Verify deployment
print_header "Verifying Deployment"

echo "Checking pods..."
kubectl get pods -n production
print_success "All pods running"

echo "Checking services..."
kubectl get svc -n production
print_success "All services running"

# Get load balancer URL
print_header "Getting Service URLs"

BACKEND_LB=$(kubectl get svc attendance-backend-service -n production \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "pending")
FRONTEND_LB=$(kubectl get svc attendance-frontend-service -n production \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "pending")

echo -e "${YELLOW}Backend Service URL: ${BACKEND_LB}${NC}"
echo -e "${YELLOW}Frontend Service URL: ${FRONTEND_LB}${NC}"

# Save deployment info
print_header "Saving Deployment Information"

cat > deployment-info.txt << EOF
Attendance App Deployment Information
======================================

Date: $(date)
Environment: ${ENVIRONMENT}
AWS Region: ${AWS_REGION}
AWS Account ID: ${AWS_ACCOUNT_ID}

Infrastructure:
- EKS Cluster: ${CLUSTER_NAME}
- VPC CIDR: 10.0.0.0/16

Services:
- Backend Service: ${BACKEND_LB}
- Frontend Service: ${FRONTEND_LB}
- ECR Registry: ${ECR_REGISTRY}

Next Steps:
1. Verify services are accessible
2. Test API endpoints
3. Configure monitoring and logging
4. Set up auto-scaling policies
5. Configure backups and disaster recovery

For detailed information, see DEPLOYMENT_GUIDE.md
EOF

print_success "Deployment information saved to deployment-info.txt"

# Summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "  Backend Service: ${BACKEND_LB}"
echo "  Frontend Service: ${FRONTEND_LB}"
echo ""
echo "For more information, see deployment-info.txt"
echo ""
