# Requested only when domains are set and no existing certificate ARN is supplied.
resource "aws_acm_certificate" "site" {
  count    = local.create_cert ? 1 : 0
  provider = aws.us_east_1

  domain_name               = var.domain_names[0]
  subject_alternative_names = slice(var.domain_names, 1, length(var.domain_names))
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# With Route 53 the validation records are created below. With external DNS (Cloudflare),
# add the records from the `acm_validation_records` output; this resource waits until ACM issues.
resource "aws_acm_certificate_validation" "site" {
  count    = local.create_cert ? 1 : 0
  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.site[0].arn
  validation_record_fqdns = local.use_route53 ? [for r in aws_route53_record.validation : r.fqdn] : null

  timeouts {
    create = "60m"
  }
}
