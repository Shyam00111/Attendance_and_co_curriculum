# RDS Instance for PostgreSQL
resource "aws_db_subnet_group" "main" {
  name_prefix = "${var.environment}-db-"
  subnet_ids  = aws_subnet.private[*].id

  tags = {
    Name = "${var.environment}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.environment}-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-rds-sg"
  }
}

resource "aws_db_instance" "main" {
  allocated_storage       = 20
  storage_type            = "gp3"
  engine                  = "postgres"
  engine_version          = "15.3"
  instance_class          = "db.t3.micro"
  db_name                 = "attendancedb"
  username                = "dbadmin"
  password                = random_password.db_password.result
  parameter_group_name    = "default.postgres15"
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  skip_final_snapshot     = var.environment == "dev"
  backup_retention_period = var.environment == "prod" ? 30 : 7
  multi_az                = var.environment == "prod"
  storage_encrypted       = true

  tags = {
    Name = "${var.environment}-postgres"
  }
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Secrets Manager for Database Password
resource "aws_secretsmanager_secret" "db_password" {
  name_prefix = "${var.environment}-db-password-"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db_password.result
}

output "rds_endpoint" {
  value       = aws_db_instance.main.endpoint
  description = "RDS endpoint"
  sensitive   = true
}

output "rds_database_name" {
  value       = aws_db_instance.main.db_name
  description = "RDS database name"
}

output "db_secret_arn" {
  value       = aws_secretsmanager_secret.db_password.arn
  description = "Database password secret ARN"
}
