pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = credentials('aws-account-id')
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        ECR_REPO_BACKEND = 'attendance-backend'
        ECR_REPO_FRONTEND = 'attendance-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_BUILDKIT = '1'
        NODEJS_VERSION = '18'
        SONARQUBE_SERVER = 'SonarQube'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "🔍 Checking out code from GitHub..."
                    checkout scm
                }
            }
        }

        stage('Setup') {
            steps {
                script {
                    echo "⚙️ Setting up environment..."
                    sh '''
                        node --version
                        npm --version
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        script {
                            echo "📦 Installing backend dependencies..."
                            sh '''
                                cd backend
                                npm install --legacy-peer-deps
                            '''
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        script {
                            echo "📦 Installing frontend dependencies..."
                            sh '''
                                cd frontend
                                npm install --legacy-peer-deps
                            '''
                        }
                    }
                }
            }
        }

        stage('Lint & Quality Checks') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        script {
                            echo "🔍 Linting backend code..."
                            sh '''
                                cd backend
                                npm run lint || true
                            '''
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        script {
                            echo "🔍 Linting frontend code..."
                            sh '''
                                cd frontend
                                npm run lint || true
                            '''
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    echo "📊 Running SonarQube analysis..."
                    withSonarQubeEnv(installationName: "${SONARQUBE_SERVER}") {
                        sh '''
                            sonar-scanner \
                              -Dsonar.projectKey=attendance-app \
                              -Dsonar.sources=. \
                              -Dsonar.exclusions=node_modules/**
                        '''
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Backend Build') {
                    steps {
                        script {
                            echo "🔨 Building backend..."
                            sh '''
                                cd backend
                                npm run build || true
                            '''
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        script {
                            echo "🔨 Building frontend..."
                            sh '''
                                cd frontend
                                npm run build
                            '''
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        script {
                            echo "🐳 Building backend Docker image..."
                            sh '''
                                cd backend
                                docker build -t ${ECR_REGISTRY}/${ECR_REPO_BACKEND}:${IMAGE_TAG} \
                                           -t ${ECR_REGISTRY}/${ECR_REPO_BACKEND}:latest \
                                           -f Dockerfile .
                            '''
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        script {
                            echo "🐳 Building frontend Docker image..."
                            sh '''
                                cd frontend
                                docker build -t ${ECR_REGISTRY}/${ECR_REPO_FRONTEND}:${IMAGE_TAG} \
                                           -t ${ECR_REGISTRY}/${ECR_REPO_FRONTEND}:latest \
                                           -f Dockerfile .
                            '''
                        }
                    }
                }
            }
        }

        stage('Push to ECR') {
            steps {
                script {
                    echo "📤 Pushing images to ECR..."
                    sh '''
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                        
                        docker push ${ECR_REGISTRY}/${ECR_REPO_BACKEND}:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/${ECR_REPO_BACKEND}:latest
                        
                        docker push ${ECR_REGISTRY}/${ECR_REPO_FRONTEND}:${IMAGE_TAG}
                        docker push ${ECR_REGISTRY}/${ECR_REPO_FRONTEND}:latest
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "☸️ Deploying to Kubernetes..."
                    sh '''
                        kubectl config use-context ${KUBE_CONTEXT}
                        
                        # Update image tags in deployment
                        kubectl set image deployment/attendance-backend \
                            attendance-backend=${ECR_REGISTRY}/${ECR_REPO_BACKEND}:${IMAGE_TAG} \
                            -n production
                            
                        kubectl set image deployment/attendance-frontend \
                            attendance-frontend=${ECR_REGISTRY}/${ECR_REPO_FRONTEND}:${IMAGE_TAG} \
                            -n production
                        
                        # Verify rollout
                        kubectl rollout status deployment/attendance-backend -n production
                        kubectl rollout status deployment/attendance-frontend -n production
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "✅ Performing health checks..."
                    sh '''
                        kubectl get pods -n production
                        kubectl get svc -n production
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning up..."
            cleanWs()
        }
        success {
            echo "✅ Pipeline succeeded!"
            // Send success notification
        }
        failure {
            echo "❌ Pipeline failed!"
            // Send failure notification
        }
    }
}
