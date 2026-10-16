output "aws_region" {
  description = "AWS region containing the EKS cluster."
  value       = var.aws_region
}

output "vpc_id" {
  description = "ID of the EKS VPC."
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the two public subnets used by EKS."
  value       = aws_subnet.public[*].id
}

output "cluster_name" {
  description = "Name of the managed EKS cluster."
  value       = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  description = "Public Kubernetes API endpoint."
  value       = aws_eks_cluster.main.endpoint
}

output "configure_kubectl" {
  description = "Command to add this EKS cluster to the local kubeconfig."
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.main.name}"
}
