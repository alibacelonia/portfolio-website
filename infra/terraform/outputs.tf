output "bucket_name" {
  description = "S3 bucket to upload the static export to (GitHub variable S3_BUCKET)."
  value       = aws_s3_bucket.site.bucket
}

output "bucket_arn" {
  value = aws_s3_bucket.site.arn
}

output "cloudfront_distribution_id" {
  description = "Distribution to invalidate after deploys (GitHub variable CLOUDFRONT_DISTRIBUTION_ID)."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_distribution_arn" {
  value = aws_cloudfront_distribution.site.arn
}

output "cloudfront_domain_name" {
  description = "Target for CNAME records when DNS is hosted outside Route 53."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "deploy_role_arn" {
  description = "IAM role for GitHub Actions (GitHub variable AWS_DEPLOY_ROLE_ARN)."
  value       = aws_iam_role.deploy.arn
}

output "site_url" {
  value = local.has_domain ? "https://${local.primary_host}" : "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "acm_validation_records" {
  description = "DNS records that prove domain ownership to ACM. Create them at your DNS host when not using Route 53."
  value = local.create_cert ? [
    for o in aws_acm_certificate.site[0].domain_validation_options : {
      name  = o.resource_record_name
      type  = o.resource_record_type
      value = o.resource_record_value
    }
  ] : []
}

output "dns_records_to_create" {
  description = "Records pointing your domains at CloudFront when DNS is hosted outside Route 53."
  value = local.has_domain && !local.use_route53 ? [
    for d in var.domain_names : {
      name  = d
      type  = "CNAME (CNAME flattening / ALIAS at the apex)"
      value = aws_cloudfront_distribution.site.domain_name
    }
  ] : []
}

output "contact_api_endpoint" {
  description = "Set as NEXT_PUBLIC_CONTACT_API_URL (GitHub variable) once the contact API is enabled."
  value       = var.enable_contact_api ? module.contact_api[0].endpoint : null
}

output "contact_ses_dkim_records" {
  description = "Add these CNAMEs in Cloudflare (DNS only) to verify the SES sender domain."
  value       = var.enable_contact_api ? module.contact_api[0].ses_dkim_records : []
}
