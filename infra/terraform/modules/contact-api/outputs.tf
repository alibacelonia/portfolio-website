output "endpoint" {
  description = "POST URL for NEXT_PUBLIC_CONTACT_API_URL."
  value       = "${aws_apigatewayv2_api.contact.api_endpoint}/contact"
}

output "api_origin" {
  description = "API origin to allow in the site's Content-Security-Policy connect-src."
  value       = aws_apigatewayv2_api.contact.api_endpoint
}

output "ses_dkim_records" {
  description = "CNAME records to add in Cloudflare (DNS only) so SES can send from the domain."
  value = [
    for token in aws_sesv2_email_identity.domain.dkim_signing_attributes[0].tokens : {
      name  = "${token}._domainkey.${var.sender_domain}"
      type  = "CNAME"
      value = "${token}.dkim.amazonses.com"
    }
  ]
}
