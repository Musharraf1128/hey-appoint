output "vpc_id" {
  value = aws_vpc.main.id
}

output "instance_public_ip" {
  description = "Public IP of the k3s EC2 instance."
  value       = aws_instance.k3s.public_ip
}
