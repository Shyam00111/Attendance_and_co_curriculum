# GitHub Deployment Checklist

Complete this checklist before pushing your code to GitHub.

## Pre-Deployment

- [ ] All tests passing
- [ ] Code linted and formatted
- [ ] Environment variables documented
- [ ] Sensitive data removed from code
- [ ] Dependencies updated and locked

## File Structure

- [ ] `.gitignore` created and properly configured
- [ ] `Dockerfile` exists for backend
- [ ] `Dockerfile` exists for frontend
- [ ] `Jenkinsfile` created
- [ ] `terraform/` directory with all .tf files
- [ ] `kubernetes/` directory with all manifests
- [ ] `jenkins/` directory with setup scripts
- [ ] `DEPLOYMENT_GUIDE.md` created
- [ ] `README.md` updated with deployment instructions

## GitHub Repository Setup

- [ ] Repository created on GitHub
- [ ] README.md updated with project description
- [ ] CONTRIBUTING.md created (optional)
- [ ] LICENSE file added
- [ ] Branch protection rules configured

## GitHub Actions/Webhooks

- [ ] GitHub webhook configured for Jenkins
- [ ] Webhook URL verified
- [ ] Personal access token created (if needed)

## AWS Setup

- [ ] AWS Account created and configured
- [ ] IAM user for Jenkins created
- [ ] IAM policies attached
- [ ] AWS credentials securely stored
- [ ] ECR repositories created
- [ ] S3 bucket for artifacts created
- [ ] RDS database instance created (if applicable)

## Terraform

- [ ] `terraform.tfvars` created (do not commit)
- [ ] S3 backend configured for state
- [ ] DynamoDB table for locks created
- [ ] `terraform plan` successful
- [ ] `terraform apply` completed successfully
- [ ] Infrastructure outputs saved

## Kubernetes

- [ ] EKS cluster created successfully
- [ ] kubectl configured and tested
- [ ] Kubernetes namespaces created
- [ ] Secrets created for sensitive data
- [ ] Network policies configured
- [ ] Resource quotas set

## Jenkins

- [ ] Jenkins server running
- [ ] All plugins installed
- [ ] AWS credentials added to Jenkins
- [ ] Kubernetes cluster configured in Jenkins
- [ ] Pipeline job created
- [ ] First build triggered successfully

## Docker Images

- [ ] Backend Dockerfile builds successfully
- [ ] Frontend Dockerfile builds successfully
- [ ] Images pushed to ECR
- [ ] Image scans completed (if enabled)

## Monitoring

- [ ] CloudWatch logs configured
- [ ] EKS logging enabled
- [ ] Prometheus/Grafana deployed (optional)
- [ ] Alarms configured for critical metrics
- [ ] Email notifications set up

## Security

- [ ] Secrets encrypted in AWS Secrets Manager
- [ ] Database encryption enabled
- [ ] Network security groups configured
- [ ] IAM policies follow least privilege principle
- [ ] SSL/TLS certificates configured (if using custom domain)
- [ ] RBAC policies applied in Kubernetes

## Documentation

- [ ] DEPLOYMENT_GUIDE.md completed
- [ ] JENKINS_AWS_SETUP.md completed
- [ ] README.md updated with deployment info
- [ ] Architecture diagram created (optional)
- [ ] Troubleshooting guide created

## Testing

- [ ] Manual deployment test completed
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] Database connectivity verified
- [ ] Logs accessible and meaningful

## Post-Deployment

- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented
- [ ] Monitoring dashboards created
- [ ] On-call runbook created
- [ ] Team trained on deployment process

## Environment-Specific

### Development
- [ ] Dev environment deployed
- [ ] Dev database populated with test data
- [ ] Dev credentials in Secrets Manager

### Staging
- [ ] Staging environment deployed
- [ ] Staging database with production-like data
- [ ] Load testing completed

### Production
- [ ] Production environment deployed
- [ ] Production backups configured
- [ ] High availability verified
- [ ] Disaster recovery tested
- [ ] Production monitoring active

## Notes

Add any specific notes or considerations for your deployment:

```
[Your notes here]
```

## Sign-Off

- [ ] DevOps Lead: __________________ Date: __________
- [ ] Engineering Lead: __________________ Date: __________
- [ ] Product Owner: __________________ Date: __________
