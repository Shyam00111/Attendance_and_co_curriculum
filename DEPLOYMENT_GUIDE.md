# Complete Deployment Guide - Attendance App on AWS with Kubernetes, Jenkins, and Terraform

## Table of Contents

1. [GitHub Setup](#github-setup)
2. [Terraform Infrastructure](#terraform-infrastructure)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Jenkins CI/CD Pipeline](#jenkins-cicd-pipeline)
5. [AWS Integration](#aws-integration)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Troubleshooting](#troubleshooting)

---

## GitHub Setup

### 1. Create GitHub Repository

```bash
# Initialize git in your project
cd Attendance_and_co_curriculum
git init

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/Attendance_and_co_curriculum.git

# Create main branch and initial commit
git add .
git commit -m "Initial commit: Attendance and Co-Curriculum Application"
git branch -M main
git push -u origin main
```

### 2. GitHub Settings

**Repository Settings:**
- **Settings → Visibility**: Public or Private
- **Settings → Branches → Protect main branch**:
  - Require pull request reviews
  - Require status checks to pass
  - Dismiss stale reviews
  - Include administrators

**GitHub Secrets** (Settings → Secrets → New repository secret):
```
AWS_ACCESS_KEY_ID: Your AWS Access Key
AWS_SECRET_ACCESS_KEY: Your AWS Secret Key
DOCKER_REGISTRY_USERNAME: Docker Hub username
DOCKER_REGISTRY_PASSWORD: Docker Hub password
```

---

## Terraform Infrastructure

### 1. Prerequisites

```bash
# Install Terraform
# On Windows (using Chocolatey)
choco install terraform

# On macOS (using Homebrew)
brew install terraform

# On Linux
wget https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip
unzip terraform_1.5.0_linux_amd64.zip -d /usr/local/bin
```

### 2. Initialize Terraform

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars
cat > terraform.tfvars << 'EOF'
aws_region            = "us-east-1"
environment           = "prod"
cluster_name          = "attendance-cluster"
cluster_version       = "1.28"
node_group_desired_size = 3
node_group_min_size   = 2
node_group_max_size   = 10
instance_types        = ["t3.medium", "t3.large"]
EOF
```

### 3. Plan and Apply Terraform

```bash
# Review the plan
terraform plan -out=tfplan

# Review the output
terraform show tfplan

# Apply the infrastructure
terraform apply tfplan

# Save outputs
terraform output -json > outputs.json
```

### 4. Verify Infrastructure

```bash
# Check EKS cluster
aws eks describe-cluster --name attendance-cluster --region us-east-1

# Get cluster endpoint
aws eks describe-cluster --name attendance-cluster --region us-east-1 \
  --query 'cluster.endpoint' --output text

# Update kubeconfig
aws eks update-kubeconfig --name attendance-cluster --region us-east-1

# Verify cluster access
kubectl cluster-info
kubectl get nodes
```

---

## Kubernetes Deployment

### 1. Create Namespaces and Secrets

```bash
# Create production namespace
kubectl create namespace production

# Create secrets (update with your values)
kubectl create secret generic app-secrets \
  --from-literal=JWT_SECRET='your-jwt-secret-key' \
  --from-literal=MONGODB_URI='mongodb+srv://user:pass@cluster.mongodb.net/db' \
  --from-literal=EMAIL_PASSWORD='your-email-password' \
  -n production

# Create image pull secret (if using private registry)
kubectl create secret docker-registry regcred \
  --docker-server=<your-registry> \
  --docker-username=<username> \
  --docker-password=<password> \
  --docker-email=<email> \
  -n production
```

### 2. Deploy Backend and Frontend

```bash
# Update image references in deployment files
sed -i 's|BACKEND_IMAGE|<your-account-id>.dkr.ecr.us-east-1.amazonaws.com/attendance-backend|g' \
  kubernetes/backend-deployment.yaml

sed -i 's|FRONTEND_IMAGE|<your-account-id>.dkr.ecr.us-east-1.amazonaws.com/attendance-frontend|g' \
  kubernetes/frontend-deployment.yaml

# Apply Kubernetes manifests
kubectl apply -f kubernetes/backend-deployment.yaml -n production
kubectl apply -f kubernetes/frontend-deployment.yaml -n production
kubectl apply -f kubernetes/ingress-and-policies.yaml -n production
```

### 3. Monitor Deployment

```bash
# Check pod status
kubectl get pods -n production
kubectl get pods -n production -w  # Watch mode

# View pod logs
kubectl logs -f deployment/attendance-backend -n production
kubectl logs -f deployment/attendance-frontend -n production

# Describe deployment
kubectl describe deployment attendance-backend -n production

# Check services
kubectl get svc -n production
kubectl get ingress -n production
```

### 4. Scale Deployments

```bash
# Scale backend
kubectl scale deployment attendance-backend --replicas=5 -n production

# Check HPA status
kubectl get hpa -n production
kubectl describe hpa attendance-backend-hpa -n production
```

---

## Jenkins CI/CD Pipeline

### 1. Install Jenkins

**Option 1: On EC2**

```bash
# Update system
sudo yum update -y

# Install Java
sudo yum install java-17-amazon-corretto -y

# Add Jenkins repository
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key

# Install Jenkins
sudo yum install jenkins -y

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Check initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Option 2: Using Docker**

```bash
# Run Jenkins in Docker
docker run -d \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name jenkins \
  jenkins/jenkins:lts
```

### 2. Initial Jenkins Setup

1. Access Jenkins: `http://localhost:8080`
2. Enter the initial admin password
3. Install suggested plugins
4. Create first admin user
5. Configure Jenkins URL

### 3. Install Required Plugins

Go to **Manage Jenkins → Manage Plugins → Available** and install:

```
- aws-credentials
- pipeline-aws
- docker-plugin
- kubernetes
- sonar
- git
- github-integration
- email-ext
```

Or via Jenkins CLI:

```bash
java -jar jenkins-cli.jar -s http://localhost:8080 install-plugin \
  aws-credentials pipeline-aws docker-plugin kubernetes sonar git \
  github-integration email-ext restart
```

### 4. Configure AWS Credentials

1. Go to **Manage Jenkins → Manage Credentials**
2. Click **Global** under **Stores scoped to Jenkins**
3. Click **Add Credentials**
4. Select **AWS Credentials**
5. Enter:
   - Access Key ID
   - Secret Access Key
   - ID: `aws-credentials`
   - Description: AWS Production Credentials

### 5. Create Pipeline Job

1. **New Item** → **Pipeline**
2. Name: `attendance-app-pipeline`
3. **Pipeline** section:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/YOUR_USERNAME/Attendance_and_co_curriculum.git`
   - Script Path: `Jenkinsfile`
4. **Build Triggers**:
   - GitHub hook trigger for GITScm polling

### 6. Configure GitHub Webhook

1. Go to your GitHub repository
2. **Settings → Webhooks → Add webhook**
3. Payload URL: `http://your-jenkins-domain.com/github-webhook/`
4. Content type: `application/json`
5. Select: Push events, Pull requests
6. Click **Add webhook**

---

## AWS Integration

### 1. Create S3 Bucket for State

```bash
# Create bucket
aws s3 mb s3://attendance-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket attendance-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket attendance-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 2. Create DynamoDB Table for Locks

```bash
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 3. Create ECR Repositories

```bash
# Backend
aws ecr create-repository \
  --repository-name attendance-backend \
  --region us-east-1

# Frontend
aws ecr create-repository \
  --repository-name attendance-frontend \
  --region us-east-1

# Set lifecycle policies
aws ecr put-lifecycle-policy \
  --repository-name attendance-backend \
  --lifecycle-policy-text file://ecr-lifecycle.json \
  --region us-east-1
```

### 4. Configure CloudWatch Logs

```bash
# Create log group
aws logs create-log-group \
  --log-group-name /aws/eks/attendance-cluster \
  --region us-east-1

# Set retention
aws logs put-retention-policy \
  --log-group-name /aws/eks/attendance-cluster \
  --retention-in-days 30 \
  --region us-east-1
```

---

## Monitoring and Logging

### 1. Install Prometheus and Grafana

```bash
# Add Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace

# Get Grafana password
kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode
```

### 2. Configure CloudWatch Container Insights

```bash
# Create IAM role for CloudWatch Container Insights
aws iam create-role --role-name CloudWatchContainerInsightsRole \
  --assume-role-policy-document file://trust-policy.json

# Attach policy
aws iam attach-role-policy --role-name CloudWatchContainerInsightsRole \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchContainerInsightsPolicy
```

### 3. Enable EKS Logging

```bash
# Update cluster logging
aws eks update-cluster-logging --name attendance-cluster \
  --logging-config clusterLogging=[{enabled=true,types=[api,audit,authenticator,controllerManager,scheduler]}]
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Terraform Apply Fails

```bash
# Check terraform logs
TF_LOG=DEBUG terraform apply

# Validate configuration
terraform validate

# Reapply with verbose output
terraform apply -auto-approve -input=false -var-file=terraform.tfvars 2>&1 | tee apply.log
```

#### 2. Jenkins Cannot Access AWS

```bash
# Check credentials
aws sts get-caller-identity

# Verify IAM permissions
aws iam get-user-policy --user-name jenkins-ci-user --policy-name jenkins-ci-policy

# Update credentials in Jenkins
# Manage Jenkins → Manage Credentials → Update aws-credentials
```

#### 3. Kubernetes Pods in Pending State

```bash
# Check pod events
kubectl describe pod <pod-name> -n production

# Check node resources
kubectl top nodes
kubectl describe node <node-name>

# Check resource requests
kubectl get pods -n production -o json | jq '.items[].spec.containers[].resources'
```

#### 4. ECR Push Failed

```bash
# Verify repository exists
aws ecr describe-repositories --region us-east-1

# Check image name
docker images | grep attendance

# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Retry push
docker push <image-name>
```

#### 5. Database Connection Issues

```bash
# Check RDS instance
aws rds describe-db-instances --db-instance-identifier <instance-id>

# Test connectivity from pod
kubectl run -it --rm debug --image=ubuntu:latest -- bash
apt-get update && apt-get install -y postgresql-client
psql -h <rds-endpoint> -U dbadmin -d attendancedb
```

---

## Maintenance

### Regular Tasks

```bash
# Update EKS cluster
aws eks update-cluster-version --name attendance-cluster --kubernetes-version 1.29

# Update node groups
aws eks update-nodegroup-version --cluster-name attendance-cluster \
  --nodegroup-name attendance-cluster-node-group --kubernetes-version 1.29

# Backup database
aws rds create-db-snapshot --db-instance-identifier attendance-db \
  --db-snapshot-identifier attendance-db-backup-$(date +%Y%m%d)

# Clean up old ECR images
aws ecr list-images --repository-name attendance-backend --region us-east-1
```

---

## Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Docker Documentation](https://docs.docker.com/)
