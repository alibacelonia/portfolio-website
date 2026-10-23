locals {
  name          = "${var.project}-${var.environment}"
  has_domain    = length(var.domain_names) > 0
  primary_host  = local.has_domain ? var.domain_names[0] : ""
  create_cert   = local.has_domain && var.acm_certificate_arn == ""
  use_route53   = local.has_domain && var.route53_zone_id != ""
  certificate   = local.create_cert ? aws_acm_certificate_validation.site[0].certificate_arn : var.acm_certificate_arn
  oidc_provider = var.create_github_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : var.github_oidc_provider_arn

  tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
