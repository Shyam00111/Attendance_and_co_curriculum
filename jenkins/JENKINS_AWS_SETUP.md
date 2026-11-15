# Jenkins Configuration for AWS Integration

This guide helps you set up Jenkins with AWS for CI/CD deployment of the Attendance Application.

## Prerequisites

- Jenkins server running (v2.370+)
- AWS Account with appropriate IAM permissions
- kubectl configured
- Docker installed on Jenkins agent nodes
- Terraform v1.0+

## Step 1: Install Required Jenkins Plugins

Go to **Manage Jenkins → Manage Plugins** and install:

1. **AWS Credentials Plugin**
   - `aws-credentials`

2. **CloudBees AWS Credentials Plugin**
   - `aws-codecommit-trigger`

3. **Pipeline AWS Steps**
   - `pipeline-aws`

4. **Docker Plugin**
   - `docker-plugin`

5. **Kubernetes Plugin**
   - `kubernetes`

6. **SonarQube Scanner**
   - `sonar`

7. **Git Plugin** (usually pre-installed)
   - `git`

```bash
# Alternative: Install via Jenkins CLI
java -jar jenkins-cli.jar -s http://localhost:8080 install-plugin \
  aws-credentials \
  pipeline-aws \
  docker-plugin \
  kubernetes \
  sonar
```

## Step 2: Configure AWS Credentials in Jenkins

### Method 1: Using AWS Access Key

1. Go to **Manage Jenkins → Manage Credentials**
2. Click **Global** under **Stores scoped to Jenkins**
3. Click **Add Credentials** and select **AWS Credentials**
4. Fill in:
   - **Kind**: AWS Credentials
   - **Access Key ID**: Your AWS Access Key
   - **Secret Access Key**: Your AWS Secret Key
   - **ID**: `aws-credentials`
   - **Description**: AWS Production Credentials

### Method 2: Using AWS IAM Role (Recommended for EC2)

If Jenkins runs on an EC2 instance with an IAM role:

1. Go to **Manage Jenkins → Configure System**
2. Scroll to **AWS** section
3. The IAM role will be auto-detected

## Step 3: Create AWS IAM User for Jenkins

```bash
# Create IAM user for Jenkins
aws iam create-user --user-name jenkins-ci-user

# Create access key
aws iam create-access-key --user-name jenkins-ci-user

# Create policy for Jenkins
cat > jenkins-policy.json << 'EOF'
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
      "Resource": "arn:aws:iam::ACCOUNT_ID:role/*"
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
      "Resource": "arn:aws:secretsmanager:*:ACCOUNT_ID:secret:*"
    }
  ]
}
EOF

# Attach policy to user
aws iam put-user-policy --user-name jenkins-ci-user --policy-name jenkins-ci-policy --policy-document file://jenkins-policy.json
```

## Step 4: Configure Kubernetes in Jenkins

1. Go to **Manage Jenkins → Configure System**
2. Scroll to **Cloud** section
3. Click **New cloud** → **Kubernetes**
4. Fill in:
   - **Kubernetes URL**: Your EKS cluster endpoint
   - **Kubernetes Namespace**: `jenkins`
   - **Jenkins URL**: `http://jenkins.jenkins.svc.cluster.local:8080`

## Step 5: Create Jenkins Pipeline

Create a new **Pipeline** job:

1. Name: `attendance-app-pipeline`
2. Pipeline definition: **Pipeline script from SCM**
3. SCM: Git
4. Repository URL: `https://github.com/your-username/Attendance_and_co_curriculum.git`
5. Script Path: `Jenkinsfile`

## Step 6: Configure GitHub Webhook

1. Go to your GitHub repository
2. **Settings → Webhooks → Add webhook**
3. Payload URL: `http://jenkins-domain.com/github-webhook/`
4. Content type: `application/json`
5. Select events: `Push events`, `Pull requests`

## Step 7: Set Environment Variables

In Jenkins job configuration, add these environment variables:

```
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=YOUR_ACCOUNT_ID
ECR_REGISTRY=YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
KUBE_CONTEXT=arn:aws:eks:us-east-1:YOUR_ACCOUNT_ID:cluster/attendance-cluster
DOCKER_REGISTRY=your-docker-registry
SONARQUBE_SERVER=SonarQube
```

## Step 8: Configure AWS Secrets Manager

Store sensitive data in AWS Secrets Manager:

```bash
# Create secrets
aws secretsmanager create-secret \
  --name attendance/jwt-secret \
  --secret-string "your-jwt-secret-key"

aws secretsmanager create-secret \
  --name attendance/mongodb-uri \
  --secret-string "mongodb+srv://user:pass@cluster.mongodb.net/db"

aws secretsmanager create-secret \
  --name attendance/email-password \
  --secret-string "your-email-app-password"
```

## Step 9: Update Jenkinsfile Credentials

In your Jenkinsfile, reference credentials:

```groovy
environment {
    AWS_CREDENTIALS = credentials('aws-credentials')
    DOCKER_CREDENTIALS = credentials('docker-credentials')
    GIT_CREDENTIALS = credentials('git-credentials')
}
```

## Step 10: Configure kubectl Access

Jenkins needs kubectl configured to access the EKS cluster:

```bash
# On Jenkins server
aws eks update-kubeconfig --region us-east-1 --name attendance-cluster

# Add kubeconfig to Jenkins environment
export KUBECONFIG=/var/lib/jenkins/.kube/config
```

## Step 11: Create Jenkins S3 Artifacts Bucket

```bash
# Create S3 bucket for build artifacts
aws s3 mb s3://attendance-app-artifacts --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket attendance-app-artifacts \
  --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block \
  --bucket attendance-app-artifacts \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

## Step 12: Configure Email Notifications

1. **Manage Jenkins → Configure System → Email Notification**
2. Set up SMTP server details
3. Add email in Jenkinsfile post actions

## Step 13: Set Up Monitoring

### CloudWatch Integration

```groovy
// In Jenkinsfile post section
post {
    success {
        script {
            sh '''
                aws cloudwatch put-metric-data \
                  --metric-name DeploymentSuccess \
                  --namespace AttendanceApp \
                  --value 1 \
                  --region us-east-1
            '''
        }
    }
    failure {
        script {
            sh '''
                aws cloudwatch put-metric-data \
                  --metric-name DeploymentFailure \
                  --namespace AttendanceApp \
                  --value 1 \
                  --region us-east-1
            '''
        }
    }
}
```

## Step 14: Test the Pipeline

1. Trigger a build manually
2. Monitor the build progress
3. Verify ECR images are pushed
4. Confirm Kubernetes deployment

## Troubleshooting

### AWS Credentials Not Found
```bash
# Verify AWS credentials configuration
jenkins-cli credentials list-items system::system

# Re-enter credentials if needed
```

### EKS Cluster Access Denied
```bash
# Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name attendance-cluster

# Verify access
kubectl get nodes
```

### ECR Push Failed
```bash
# Check ECR repository exists
aws ecr describe-repositories --region us-east-1

# Check IAM permissions
aws iam get-user-policy --user-name jenkins-ci-user --policy-name jenkins-ci-policy
```

## Security Best Practices

1. **Use IAM Roles**: Prefer IAM roles over access keys
2. **Rotate Credentials**: Regularly rotate AWS access keys
3. **Use Secrets Manager**: Store sensitive data in AWS Secrets Manager
4. **Restrict Permissions**: Use least privilege principle for IAM policies
5. **Enable Audit Logging**: Enable CloudTrail for API calls
6. **Network Security**: Use security groups and network policies
7. **RBAC**: Implement Kubernetes RBAC policies
8. **Encryption**: Enable encryption for EBS, S3, and databases

## Next Steps

1. Review and customize the Jenkinsfile for your environment
2. Set up monitoring and alerting
3. Configure backup and disaster recovery
4. Implement GitOps workflow with ArgoCD (optional)
5. Set up staging environment pipeline

## Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)
- [EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
