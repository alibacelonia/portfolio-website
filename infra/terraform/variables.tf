variable "project" {
  description = "Name used for resource names and tags."
  type        = string
  default     = "alibacelonia-portfolio"
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
  default     = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests"
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

# ---------- Contact API (API Gateway + Lambda + DynamoDB + SES), off until approved ----------

variable "enable_contact_api" {
  description = "Create the contact form backend. Chargeable resources; enable only with owner approval."
  type        = bool
  default     = false
}

variable "contact_sender_domain" {
  description = "Domain verified in SES for the contact form's From address."
  type        = string
  default     = "alibacelonia.dev"
}

variable "contact_from_address" {
  description = "From address for contact form emails (must be at contact_sender_domain)."
  type        = string
  default     = "noreply@alibacelonia.dev"
}

variable "contact_to_address" {
  description = "Inbox that receives contact form messages."
  type        = string
  default     = "alibacelonia1234@gmail.com"
}

variable "contact_allowed_origins" {
  description = "Origins allowed to call the contact API. Defaults to https:// + each domain_names entry."
  type        = list(string)
  default     = []
}

variable "turnstile_secret_parameter" {
  description = "SSM SecureString name holding the Cloudflare Turnstile secret (create it with the AWS CLI; never in Terraform)."
  type        = string
  default     = "/alibacelonia-portfolio/turnstile-secret"
}

variable "cal_origin" {
  description = "Booking embed origin allowed in frame-src (Cal.com)."
  type        = string
  default     = "https://cal.com"
}
