# Only used when the domain's DNS is hosted in Route 53 (route53_zone_id set).
resource "aws_route53_record" "validation" {
  for_each = local.use_route53 && local.create_cert ? {
    for o in aws_acm_certificate.site[0].domain_validation_options : o.domain_name => o
  } : {}

  zone_id         = var.route53_zone_id
  name            = each.value.resource_record_name
  type            = each.value.resource_record_type
  records         = [each.value.resource_record_value]
  ttl             = 300
  allow_overwrite = true
}

resource "aws_route53_record" "alias" {
  for_each = local.use_route53 ? toset(flatten([for d in var.domain_names : ["${d}|A", "${d}|AAAA"]])) : toset([])

  zone_id = var.route53_zone_id
  name    = split("|", each.value)[0]
  type    = split("|", each.value)[1]

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
