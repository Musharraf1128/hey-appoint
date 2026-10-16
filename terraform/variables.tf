variable "aws_region" {
  description = "AWS region for the EKS demo infrastructure."
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Short name used in resource names and tags."
  type        = string
  default     = "appoint"
}

variable "environment" {
  description = "Deployment environment label."
  type        = string
  default     = "demo"
}

variable "vpc_cidr" {
  description = "CIDR range for the EKS VPC."
  type        = string
  default     = "10.30.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Two public subnet CIDRs, one per Availability Zone."
  type        = list(string)
  default     = ["10.30.1.0/24", "10.30.2.0/24"]

  validation {
    condition     = length(var.public_subnet_cidrs) == 2
    error_message = "Exactly two public subnet CIDRs are required for this EKS deployment."
  }
}

variable "kubernetes_version" {
  description = "Supported EKS Kubernetes version."
  type        = string
  default     = "1.34"
}

variable "node_instance_types" {
  description = "Instance types for the managed EKS node group."
  type        = list(string)
  default     = ["t3.micro"]
}

variable "node_min_size" {
  description = "Minimum worker-node count."
  type        = number
  default     = 1
}

variable "node_desired_size" {
  description = "Initial worker-node count."
  type        = number
  default     = 1
}

variable "node_max_size" {
  description = "Maximum worker-node count."
  type        = number
  default     = 2
}
