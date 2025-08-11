output "name_servers" {
    description = "Cloud DNS nameservers to set at GoDaddy"
    value       = google_dns_managed_zone.primary.name_servers
}
