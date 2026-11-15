# Attendance & Co-Curriculum App - Deployment Guide

## Quick Start Overview

This project is configured for deployment on AWS using:
- **Infrastructure**: Terraform (IaC)
- **Container Orchestration**: Kubernetes (EKS)
- **CI/CD**: Jenkins
- **Container Registry**: AWS ECR
- **Database**: MongoDB Atlas / PostgreSQL RDS

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [GitHub Setup](#github-setup)
3. [AWS Infrastructure Setup](#aws-infrastructure-setup)
4. [Jenkins CI/CD Setup](#jenkins-cicd-setup)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Monitoring & Logging](#monitoring--logging)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

```bash
# Check installations
terraform --version        # v1.0+
aws --version             # Latest
kubectl version           # v1.26+
docker --version          # Latest
git --version             # Latest
```

### AWS Account Requirements

- ✅ AWS Account with appropriate permissions
- ✅ IAM user with programmatic access
- ✅ Budget alerts configured
- ✅ CloudTrail enabled

### Local Setup

```bash
# Configure AWS credentials
aws configure

# Verify access
aws sts get-caller-identity
```

---

## GitHub Setup

### 1. Create GitHub Repository

```bash
# Initialize and push to GitHub
cd Attendance_and_co_curriculum
git init
git remote add origin https://github.com/YOUR_USERNAME/Attendance_and_co_curriculum.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

### 2. Generate GitHub Token

1. Go to GitHub **Settings → Developer settings → Personal access tokens**
2. Click **Generate new token**
3. Select scopes: `repo`, `admin:repo_hook`
4. Copy the token (you'll need this for Jenkins)

### 3. Protect Main Branch

1. Go to **Settings → Branches**
2. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Dismiss stale reviews

---

## AWS Infrastructure Setup

### Step 1: Create AWS Resources with Terraform

```bash
cd terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars
cat > terraform.tfvars << 'EOF'
aws_region             = "us-east-1"
environment            = "prod"
cluster_name           = "attendance-cluster"
cluster_version        = "1.28"
node_group_desired_size = 3
node_group_min_size    = 2
node_group_max_size    = 10
instance_types         = ["t3.medium", "t3.large"]
EOF

# Review the plan
terraform plan

# Apply infrastructure
terraform apply
```

### Step 2: Verify Infrastructure

```bash
# Check EKS cluster
aws eks describe-cluster --name attendance-cluster --region us-east-1

# Update kubeconfig
aws eks update-kubeconfig --name attendance-cluster --region us-east-1

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### Step 3: Create ECR Repositories

```bash
# Already created by Terraform, verify:
aws ecr describe-repositories --region us-east-1
```

---

## Jenkins CI/CD Setup

### Step 1: Install Jenkins

**Option A: Docker**
```bash
docker run -d \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name jenkins \
  jenkins/jenkins:lts
```

**Option B: EC2**
```bash
# See jenkins/JENKINS_AWS_SETUP.md for detailed instructions
bash jenkins/setup-jenkins-aws.sh
```

### Step 2: Initial Setup

1. Access **http://localhost:8080**
2. Get initial password: `docker logs jenkins` (or from `/var/lib/jenkins/secrets/initialAdminPassword`)
3. Install suggested plugins
4. Create admin user

### Step 3: Install Required Plugins

Go to **Manage Jenkins → Manage Plugins** and install:
- aws-credentials
- pipeline-aws
- docker-plugin
- kubernetes
- sonar
- git
- email-ext

### Step 4: Configure AWS Credentials

1. **Manage Jenkins → Manage Credentials**
2. **Global → Add Credentials**
3. Select **AWS Credentials**
4. Enter AWS Access Key and Secret Key
5. ID: `aws-credentials`

### Step 5: Configure Kubernetes

1. **Manage Jenkins → Configure System**
2. Under **Cloud**, add **Kubernetes**:
   - Kubernetes URL: `https://[EKS-ENDPOINT]`
   - Namespace: `jenkins`
   - Jenkins URL: `http://jenkins.jenkins.svc.cluster.local:8080`

### Step 6: Create Pipeline Job

1. **New Item** → **Pipeline**
2. Name: `attendance-app-pipeline`
3. **Pipeline** section:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: `https://github.com/YOUR_USERNAME/Attendance_and_co_curriculum.git`
   - Script Path: `Jenkinsfile`
4. **Build Triggers**: ✅ GitHub hook trigger

### Step 7: Configure GitHub Webhook

1. **GitHub Repository → Settings → Webhooks → Add webhook**
2. Payload URL: `http://your-jenkins-domain:8080/github-webhook/`
3. Content type: `application/json`
4. Events: Push, Pull requests

---

## Kubernetes Deployment

### Step 1: Create Namespace and Secrets

```bash
# Create namespace
kubectl create namespace production

# Create secrets (update with your values)
kubectl create secret generic app-secrets \
  --from-literal=JWT_SECRET='your-jwt-secret-key' \
  --from-literal=MONGODB_URI='your-mongodb-uri' \
  -n production
```

### Step 2: Update Kubernetes Manifests

```bash
# Update image references
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com"

sed -i "s|BACKEND_IMAGE|${ECR_REGISTRY}/attendance-backend|g" kubernetes/backend-deployment.yaml
sed -i "s|FRONTEND_IMAGE|${ECR_REGISTRY}/attendance-frontend|g" kubernetes/frontend-deployment.yaml
```

### Step 3: Deploy Applications

```bash
# Deploy backend
kubectl apply -f kubernetes/backend-deployment.yaml -n production

# Deploy frontend
kubectl apply -f kubernetes/frontend-deployment.yaml -n production

# Deploy ingress and policies
kubectl apply -f kubernetes/ingress-and-policies.yaml -n production
```

### Step 4: Verify Deployment

```bash
# Check pods
kubectl get pods -n production

# Watch deployment progress
kubectl get pods -n production -w

# Check services
kubectl get svc -n production

# View logs
kubectl logs -f deployment/attendance-backend -n production
```

---

## Monitoring & Logging

### CloudWatch Logs

```bash
# View EKS cluster logs
aws logs describe-log-groups | grep eks

# View specific logs
aws logs tail /aws/eks/attendance-cluster --follow
```

### Prometheus & Grafana (Optional)

```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring

# Get Grafana password
kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode
```

---

## Scaling & Auto-Scaling

### Manual Scaling

```bash
# Scale deployment
kubectl scale deployment attendance-backend --replicas=5 -n production

# Check HPA status
kubectl get hpa -n production
```

### Auto-Scaling

HPA is pre-configured in the deployment manifests:
- Min replicas: 2
- Max replicas: 10
- Trigger: 70% CPU utilization

---

## Troubleshooting

### Check Kubernetes Status

```bash
# Describe a pod
kubectl describe pod attendance-backend-xxxxx -n production

# View pod logs
kubectl logs -f pod/attendance-backend-xxxxx -n production

# Check resource usage
kubectl top nodes
kubectl top pods -n production
```

### Debug Networking

```bash
# Test DNS resolution
kubectl run -it --rm debug --image=alpine:latest -- nslookup attendance-backend-service.production

# Check service connectivity
kubectl run -it --rm debug --image=curlimages/curl:latest -- curl http://attendance-backend-service:3000/health
```

### Check AWS Resources

```bash
# Verify ECR images
aws ecr list-images --repository-name attendance-backend

# Check RDS connectivity
aws rds describe-db-instances --db-instance-identifier attendance-db

# View S3 artifacts
aws s3 ls s3://attendance-app-artifacts/
```

---

## Common Tasks

### Update Deployment

```bash
# Update image
kubectl set image deployment/attendance-backend \
  attendance-backend=ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/attendance-backend:NEW_TAG \
  -n production

# Check rollout status
kubectl rollout status deployment/attendance-backend -n production
```

### View Application Logs

```bash
# Last 100 lines
kubectl logs --tail=100 deployment/attendance-backend -n production

# Stream logs
kubectl logs -f deployment/attendance-backend -n production

# Previous pod logs
kubectl logs deployment/attendance-backend --previous -n production
```

### Execute Commands in Pod

```bash
# Get shell access
kubectl exec -it deployment/attendance-backend -n production -- /bin/sh

# Run a command
kubectl exec deployment/attendance-backend -n production -- npm test
```

---

## Production Checklist

- [ ] All Terraform modules tested
- [ ] Jenkins pipeline tested with dry run
- [ ] SSL/TLS certificates configured
- [ ] Database backups scheduled
- [ ] Monitoring and alerts configured
- [ ] Disaster recovery plan documented
- [ ] Security scanning enabled (Trivy)
- [ ] RBAC policies applied
- [ ] Network policies enforced
- [ ] Resource quotas set

---

## Documentation Files

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Detailed deployment instructions
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[jenkins/JENKINS_AWS_SETUP.md](./jenkins/JENKINS_AWS_SETUP.md)** - Jenkins AWS integration
- **[terraform/](./terraform/)** - Terraform configuration files
- **[kubernetes/](./kubernetes/)** - Kubernetes manifest files
- **[jenkins/](./jenkins/)** - Jenkins configuration and scripts

---

## Quick Commands Reference

```bash
# Terraform
terraform init              # Initialize Terraform
terraform plan             # Review infrastructure changes
terraform apply            # Deploy infrastructure
terraform destroy          # Destroy infrastructure (careful!)

# Kubernetes
kubectl get pods          # List pods
kubectl describe pod NAME  # Get pod details
kubectl logs DEPLOYMENT    # View application logs
kubectl apply -f FILE     # Apply manifest
kubectl delete -f FILE    # Delete resources
kubectl port-forward      # Forward ports

# AWS
aws eks update-kubeconfig  # Update kubectl config
aws ecr list-images        # List ECR images
aws s3 ls                 # List S3 buckets
aws iam list-users        # List IAM users
```

---

## Support & Additional Resources

- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)

---

## License

See LICENSE file for details.

---

## Contact & Support

For issues or questions:
1. Check the troubleshooting section
2. Review documentation files
3. Check Jenkins build logs
4. Check Kubernetes pod logs
5. Review AWS CloudWatch logs

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready
