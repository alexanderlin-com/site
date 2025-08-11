variable "project_id" { type = string }
variable "domain"     { type = string } # "alexanderlin.com."

# Paste the exact values from:
# gcloud beta run domain-mappings describe --domain alexanderlin.com --region us-central1
variable "apex_a_values"   { type = list(string) }   # e.g. ["216.239.32.21", "216.239.34.21", ...]
variable "apex_aaaa_values"{ type = list(string) }   # e.g. ["2001:4860:4802:32::15", ...]
variable "www_cname"       { type = string }         # e.g. "ghs.googlehosted.com."

# Email (MX/SPF/DKIM) — copy from current zone (Bluehost) or your mail provider
variable "mx_records" {
  type = list(object({ priority = number, server = string }))
  default = []  # fill before apply if you use email on this domain
}
variable "txt_records" {
  type    = list(string)
  default = []  # include SPF, verification, etc.
}
