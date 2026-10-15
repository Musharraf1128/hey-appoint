variable "aws_region" {
  description = "AWS region for the demo infrastructure."
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type for the k3s node."
  type        = string
  default     = "t3.medium"
}
