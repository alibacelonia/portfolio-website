locals {
  name          = "${var.project}-${var.environment}"
  has_domain    = length(var.domain_names) > 0
  primary_host  = local.has_domain ? var.domain_names[0] : ""
  create_cert   = local.has_domain && var.acm_certificate_arn == ""
  use_route53   = local.has_domain && var.route53_zone_id != ""
  certificate   = local.create_cert ? aws_acm_certificate_validation.site[0].certificate_arn : var.acm_certificate_arn
  oidc_provider = var.create_github_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : var.github_oidc_provider_arn

  # e.g. repo:owner@123/name@456 (immutable subject) or repo:owner/name (legacy).
  github_sub_prefix = var.github_oidc_subject_prefix != "" ? var.github_oidc_subject_prefix : "repo:${var.github_repository}"

  contact_origins = length(var.contact_allowed_origins) > 0 ? var.contact_allowed_origins : [for d in var.domain_names : "https://${d}"]
  contact_api     = var.enable_contact_api ? module.contact_api[0].api_origin : ""

  # The base policy plus the third parties the Connect page uses: Cloudflare Turnstile (script,
  # frame, verification calls), the Cal.com booking embed, and the contact API when enabled.
  content_security_policy = replace(replace(replace(var.content_security_policy,
    "script-src 'self' 'unsafe-inline'", "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com"),
    "connect-src 'self'", trimspace("connect-src 'self' https://challenges.cloudflare.com ${local.contact_api}")),
  "frame-ancestors 'none'", "frame-src https://challenges.cloudflare.com ${var.cal_origin}; frame-ancestors 'none'")

  tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
