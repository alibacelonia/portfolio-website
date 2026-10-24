module "contact_api" {
  source = "./modules/contact-api"
  count  = var.enable_contact_api ? 1 : 0

  name                       = local.name
  allowed_origins            = local.contact_origins
  sender_domain              = var.contact_sender_domain
  from_address               = var.contact_from_address
  to_address                 = var.contact_to_address
  turnstile_secret_parameter = var.turnstile_secret_parameter
}
