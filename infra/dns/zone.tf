# infra/dns/zone.tf
resource "google_dns_managed_zone" "primary" {
  name        = "primary-zone"
  dns_name    = var.domain
  description = "Primary DNS zone for alexanderlin.com"
  depends_on  = [google_project_service.dns]
}

# Apex A
resource "google_dns_record_set" "apex_a" {
  count        = length(var.apex_a_values) > 0 ? 1 : 0
  name         = var.domain
  type         = "A"
  ttl          = 300
  managed_zone = google_dns_managed_zone.primary.name
  rrdatas      = var.apex_a_values
}

# Apex AAAA
resource "google_dns_record_set" "apex_aaaa" {
  count        = length(var.apex_aaaa_values) > 0 ? 1 : 0
  name         = var.domain
  type         = "AAAA"
  ttl          = 300
  managed_zone = google_dns_managed_zone.primary.name
  rrdatas      = var.apex_aaaa_values
}

# www → CNAME
resource "google_dns_record_set" "www_cname" {
  count        = length(trimspace(var.www_cname)) > 0 ? 1 : 0
  name         = "www.${var.domain}"
  type         = "CNAME"
  ttl          = 300
  managed_zone = google_dns_managed_zone.primary.name
  rrdatas      = [var.www_cname]
}

# MX (optional)
resource "google_dns_record_set" "mx" {
  count        = length(var.mx_records) > 0 ? 1 : 0
  name         = var.domain
  type         = "MX"
  ttl          = 300
  managed_zone = google_dns_managed_zone.primary.name
  rrdatas      = [for r in var.mx_records : "${r.priority} ${r.server}"]
}

# TXT (optional)
resource "google_dns_record_set" "txt" {
  count        = length(var.txt_records) > 0 ? 1 : 0
  name         = var.domain
  type         = "TXT"
  ttl          = 300
  managed_zone = google_dns_managed_zone.primary.name
  rrdatas      = var.txt_records
}
