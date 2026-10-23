variable "project" {
  description = "Name used for resource names and tags."
  type        = string
  default     = "maba-portfolio"
}

variable "environment" {
  description = "Deployment environment name, used in names and tags."
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "Region for the S3 bucket and IAM resources. CloudFront and its certificate are global/us-east-1."
  type        = string
  default     = "ap-southeast-1"
}

variable "bucket_name" {
  description = "Exact S3 bucket name. Leave empty to generate a unique name from the project prefix."
  type        = string
  default     = ""
}

variable "force_destroy" {
  description = "Allow `terraform destroy` to delete a non-empty bucket. Keep false in production."
  type        = bool
  default     = false
}

variable "noncurrent_version_retention_days" {
  description = "Days to keep previous object versions for rollback."
  type        = number
  default     = 30
}

variable "domain_names" {
  description = "Custom domains served by CloudFront. The first is the primary (canonical) host; others redirect to it. Empty = use the *.cloudfront.net domain only."
  type        = list(string)
  default     = []

  validation {
    condition     = alltrue([for d in var.domain_names : can(regex("^[a-z0-9.-]+\\.[a-z]{2,}$", d))])
    error_message = "domain_names must be lowercase hostnames without scheme or path."
  }
}

variable "acm_certificate_arn" {
  description = "Existing us-east-1 ACM certificate covering domain_names. Leave empty to have Terraform request one."
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone for domain_names. Leave empty when DNS is hosted elsewhere (e.g. Cloudflare); records are then output for manual creation."
  type        = string
  default     = ""
}

variable "price_class" {
  description = "CloudFront price class. PriceClass_200 includes Asia edge locations."
  type        = string
  default     = "PriceClass_200"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.price_class)
    error_message = "price_class must be PriceClass_100, PriceClass_200 or PriceClass_All."
  }
}

variable "content_security_policy" {
  description = "Content-Security-Policy header. 'unsafe-inline' scripts are required by Next.js static export inline payloads."
  type        = string
  default     = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://formspree.io; form-action 'self' https://formspree.io; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests"
}

variable "github_repository" {
  description = "GitHub repository allowed to deploy, as owner/name."
  type        = string
  default     = "alibacelonia/portfolio-website"

  validation {
    condition     = can(regex("^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$", var.github_repository))
    error_message = "github_repository must look like owner/name."
  }
}

variable "github_environment" {
  description = "GitHub Actions environment whose jobs may assume the deploy role."
  type        = string
  default     = "production"
}

variable "create_github_oidc_provider" {
  description = "Create the account-wide GitHub OIDC provider. Set false if the account already has one and pass its ARN."
  type        = bool
  default     = true
}

variable "github_oidc_provider_arn" {
  description = "Existing GitHub OIDC provider ARN, used when create_github_oidc_provider is false."
  type        = string
  default     = ""
}
