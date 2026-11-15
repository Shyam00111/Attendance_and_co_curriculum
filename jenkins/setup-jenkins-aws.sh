#!/bin/bash

# Jenkins AWS Integration Setup Script
# This script automates the setup of Jenkins with AWS

set -e

echo "=== Jenkins AWS Integration Setup ==="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    command -v aws >/dev/null 2>&1 || { echo -e "${RED}AWS CLI is not installed${NC}"; exit 1; }
    command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}kubectl is not installed${NC}"; exit 1; }
    command -v jq >/dev/null 2>&1 || { echo -e "${RED}jq is not installed${NC}"; exit 1; }
    
    echo -e "${GREEN}All prerequisites met${NC}"
}

# Set AWS variables
set_aws_variables() {
    echo -e "${YELLOW}Setting AWS variables...${NC}"
    
    read -p "Enter AWS Region [us-east-1]: " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-east-1}
    
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${GREEN}AWS Account ID: $AWS_ACCOUNT_ID${NC}"
}

# Create IAM user for Jenkins
create_jenkins_iam_user() {
    echo -e "${YELLOW}Creating Jenkins IAM user...${NC}"
    
    if aws iam get-user --user-name jenkins-ci-user 2>/dev/null; then
        echo -e "${YELLOW}Jenkins IAM user already exists${NC}"
    else
        aws iam create-user --user-name jenkins-ci-user
        echo -e "${GREEN}Jenkins IAM user created${NC}"
    fi
}

# Create and attach IAM policy
create_jenkins_policy() {
    echo -e "${YELLOW}Creating Jenkins IAM policy...${NC}"
    
    cat > /tmp/jenkins-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:DescribeRepositories",
        "ecr:ListImages"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "eks:DescribeCluster",
        "eks:ListClusters",
        "eks:UpdateClusterVersion"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::attendance-app-artifacts",
        "arn:aws:s3:::attendance-app-artifacts/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:${AWS_ACCOUNT_ID}:secret:*"
    }
  ]
}
EOF

    aws iam put-user-policy --user-name jenkins-ci-user --policy-name jenkins-ci-policy --policy-document file:///tmp/jenkins-policy.json
    echo -e "${GREEN}Jenkins IAM policy created${NC}"
}

# Create ECR repositories
create_ecr_repos() {
    echo -e "${YELLOW}Creating ECR repositories...${NC}"
    
    for repo in attendance-backend attendance-frontend; do
        if aws ecr describe-repositories --repository-names $repo --region $AWS_REGION 2>/dev/null; then
            echo -e "${YELLOW}ECR repository $repo already exists${NC}"
        else
            aws ecr create-repository --repository-name $repo --region $AWS_REGION
            echo -e "${GREEN}ECR repository $repo created${NC}"
        fi
    done
}

# Create S3 bucket for artifacts
create_s3_bucket() {
    echo -e "${YELLOW}Creating S3 bucket for artifacts...${NC}"
    
    if aws s3 ls s3://attendance-app-artifacts 2>/dev/null; then
        echo -e "${YELLOW}S3 bucket already exists${NC}"
    else
        aws s3 mb s3://attendance-app-artifacts --region $AWS_REGION
        aws s3api put-bucket-versioning \
            --bucket attendance-app-artifacts \
            --versioning-configuration Status=Enabled
        aws s3api put-public-access-block \
            --bucket attendance-app-artifacts \
            --public-access-block-configuration \
            "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
        echo -e "${GREEN}S3 bucket created and configured${NC}"
    fi
}

# Create AWS Secrets Manager entries
create_secrets() {
    echo -e "${YELLOW}Creating AWS Secrets Manager entries...${NC}"
    
    read -sp "Enter JWT Secret: " JWT_SECRET
    echo
    read -p "Enter MongoDB URI: " MONGODB_URI
    read -sp "Enter Email Password: " EMAIL_PASSWORD
    echo
    
    aws secretsmanager create-secret \
        --name attendance/jwt-secret \
        --secret-string "$JWT_SECRET" \
        --region $AWS_REGION 2>/dev/null || \
    aws secretsmanager update-secret \
        --secret-id attendance/jwt-secret \
        --secret-string "$JWT_SECRET" \
        --region $AWS_REGION
    
    echo -e "${GREEN}JWT Secret stored${NC}"
    
    # Similar for other secrets...
}

# Generate IAM access keys
generate_access_keys() {
    echo -e "${YELLOW}Generating IAM access keys for Jenkins...${NC}"
    
    # Delete existing keys
    aws iam list-access-keys --user-name jenkins-ci-user | \
        jq '.AccessKeyMetadata[].AccessKeyId' -r | \
        xargs -I {} aws iam delete-access-key --user-name jenkins-ci-user --access-key-id {}
    
    # Create new key
    CREDENTIALS=$(aws iam create-access-key --user-name jenkins-ci-user)
    
    ACCESS_KEY=$(echo $CREDENTIALS | jq '.AccessKey.AccessKeyId' -r)
    SECRET_KEY=$(echo $CREDENTIALS | jq '.AccessKey.SecretAccessKey' -r)
    
    echo -e "${GREEN}Access keys generated${NC}"
    echo "Save these credentials securely:"
    echo "Access Key ID: $ACCESS_KEY"
    echo "Secret Access Key: $SECRET_KEY"
}

# Create Jenkins config file
create_jenkins_config() {
    echo -e "${YELLOW}Creating Jenkins configuration...${NC}"
    
    cat > ./jenkins-aws-config.env << EOF
export AWS_REGION=$AWS_REGION
export AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID
export ECR_REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
export KUBE_CLUSTER=attendance-cluster
export KUBE_CONTEXT=arn:aws:eks:$AWS_REGION:$AWS_ACCOUNT_ID:cluster/attendance-cluster
EOF

    echo -e "${GREEN}Jenkins configuration saved to jenkins-aws-config.env${NC}"
}

# Main execution
main() {
    check_prerequisites
    set_aws_variables
    create_jenkins_iam_user
    create_jenkins_policy
    create_ecr_repos
    create_s3_bucket
    generate_access_keys
    create_jenkins_config
    
    echo -e "${GREEN}=== Setup Complete ===${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Copy the Access Key ID and Secret Access Key above"
    echo "2. Add them to Jenkins as AWS Credentials"
    echo "3. Update the Jenkinsfile with your GitHub repository URL"
    echo "4. Trigger a build to test"
}

main
