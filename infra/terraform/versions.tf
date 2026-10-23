terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Partial configuration: pass bucket/key/region with `terraform init -backend-config=backend.hcl`.
  # See backend.hcl.example. S3-native locking (use_lockfile) needs Terraform >= 1.10.
  backend "s3" {}
}
