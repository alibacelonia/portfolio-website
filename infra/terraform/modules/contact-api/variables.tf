variable "name" {
  description = "Resource name prefix, e.g. alibacelonia-portfolio-production."
  type        = string
}

variable "allowed_origins" {
  description = "Browser origins allowed to call the API (CORS and an in-function check)."
  type        = list(string)
}

variable "sender_domain" {
  description = "Domain verified in SES and used in the From address."
  type        = string
}

variable "from_address" {
  description = "SES sender, an address at sender_domain."
  type        = string
}

variable "to_address" {
  description = "Inbox that receives contact messages."
  type        = string
}

variable "turnstile_secret_parameter" {
  description = "SSM SecureString parameter holding the Cloudflare Turnstile secret key. Created outside Terraform so the secret never enters state."
  type        = string
}

variable "ip_limit_per_hour" {
  description = "Messages accepted per client IP per hour."
  type        = number
  default     = 5
}

variable "daily_limit" {
  description = "Messages accepted per day across all visitors."
  type        = number
  default     = 50
}

variable "duplicate_window_hours" {
  description = "Identical messages from the same address are rejected for this long."
  type        = number
  default     = 24
}

variable "throttle_rate" {
  description = "API Gateway steady-state requests per second."
  type        = number
  default     = 2
}

variable "throttle_burst" {
  description = "API Gateway burst limit."
  type        = number
  default     = 5
}

variable "log_retention_days" {
  description = "CloudWatch log retention for the function and API access logs."
  type        = number
  default     = 30
}
