data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  parameter_arn = "arn:aws:ssm:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:parameter/${trimprefix(var.turnstile_secret_parameter, "/")}"
}

# ---------- DynamoDB: rate-limit counters and duplicate fingerprints (auto-expiring) ----------
resource "aws_dynamodb_table" "contact" {
  name         = "${var.name}-contact"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"

  attribute {
    name = "pk"
    type = "S"
  }

  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = false # Short-lived counters only; nothing worth restoring.
  }
}

# ---------- SES: domain identity (DKIM records are output for Cloudflare) and the recipient ----------
resource "aws_sesv2_email_identity" "domain" {
  email_identity = var.sender_domain
}

# While the account is in the SES sandbox, recipients must be verified too. Applying this sends a
# confirmation email to the inbox.
resource "aws_sesv2_email_identity" "recipient" {
  email_identity = var.to_address
}

# ---------- Lambda ----------
data "archive_file" "contact" {
  type        = "zip"
  source_dir  = "${path.module}/../../../lambda/contact"
  output_path = "${path.module}/.build/contact.zip"
  excludes    = ["contact.d.mts"]
}

resource "aws_cloudwatch_log_group" "function" {
  name              = "/aws/lambda/${var.name}-contact"
  retention_in_days = var.log_retention_days
}

data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "contact" {
  name               = "${var.name}-contact"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

data "aws_iam_policy_document" "contact" {
  statement {
    sid       = "Logs"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.function.arn}:*"]
  }
  statement {
    sid       = "Counters"
    actions   = ["dynamodb:UpdateItem", "dynamodb:PutItem", "dynamodb:DeleteItem"]
    resources = [aws_dynamodb_table.contact.arn]
  }
  statement {
    sid       = "TurnstileSecret"
    actions   = ["ssm:GetParameter"]
    resources = [local.parameter_arn]
  }
  statement {
    sid     = "SendFromDomainOnly"
    actions = ["ses:SendEmail"]
    resources = [
      aws_sesv2_email_identity.domain.arn,
      aws_sesv2_email_identity.recipient.arn,
    ]
    condition {
      test     = "StringEquals"
      variable = "ses:FromAddress"
      values   = [var.from_address]
    }
  }
}

resource "aws_iam_role_policy" "contact" {
  name   = "contact"
  role   = aws_iam_role.contact.id
  policy = data.aws_iam_policy_document.contact.json
}

resource "aws_lambda_function" "contact" {
  function_name    = "${var.name}-contact"
  role             = aws_iam_role.contact.arn
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  handler          = "index.handler"
  filename         = data.archive_file.contact.output_path
  source_code_hash = data.archive_file.contact.output_base64sha256
  memory_size      = 256
  timeout          = 10
  # Caps concurrent executions as a cost backstop on top of API throttling.
  reserved_concurrent_executions = 5

  environment {
    variables = {
      TABLE_NAME                 = aws_dynamodb_table.contact.name
      ALLOWED_ORIGINS            = join(",", var.allowed_origins)
      FROM_ADDRESS               = var.from_address
      TO_ADDRESS                 = var.to_address
      TURNSTILE_SECRET_PARAMETER = var.turnstile_secret_parameter
      IP_LIMIT_PER_HOUR          = tostring(var.ip_limit_per_hour)
      DAILY_LIMIT                = tostring(var.daily_limit)
      DUPLICATE_WINDOW_HOURS     = tostring(var.duplicate_window_hours)
    }
  }

  depends_on = [aws_cloudwatch_log_group.function, aws_iam_role_policy.contact]
}

# ---------- API Gateway HTTP API: POST /contact ----------
resource "aws_apigatewayv2_api" "contact" {
  name          = "${var.name}-contact"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = var.allowed_origins
    allow_methods = ["POST", "OPTIONS"]
    allow_headers = ["content-type"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_integration" "contact" {
  api_id                 = aws_apigatewayv2_api.contact.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.contact.invoke_arn
  payload_format_version = "2.0"
  timeout_milliseconds   = 10000
}

resource "aws_apigatewayv2_route" "contact" {
  api_id    = aws_apigatewayv2_api.contact.id
  route_key = "POST /contact"
  target    = "integrations/${aws_apigatewayv2_integration.contact.id}"
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/apigateway/${var.name}-contact"
  retention_in_days = var.log_retention_days
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.contact.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_rate_limit  = var.throttle_rate
    throttling_burst_limit = var.throttle_burst
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api.arn
    format = jsonencode({
      requestId = "$context.requestId"
      routeKey  = "$context.routeKey"
      status    = "$context.status"
      latency   = "$context.responseLatency"
    })
  }
}

resource "aws_lambda_permission" "api" {
  statement_id  = "AllowApiGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.contact.execution_arn}/*/*/contact"
}
