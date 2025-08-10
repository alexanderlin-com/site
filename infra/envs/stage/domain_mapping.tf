data "google_project" "me" {}

# Apex → site-stage
resource "google_cloud_run_domain_mapping" "apex" {
  name     = "alexanderlin.com"
  location = var.region
  metadata { namespace = data.google_project.me.project_id }
  spec     { route_name = google_cloud_run_v2_service.site.name }
}

# Optional: www → site-stage (we’ll redirect to apex via middleware)
resource "google_cloud_run_domain_mapping" "www" {
  name     = "www.alexanderlin.com"
  location = var.region
  metadata { namespace = data.google_project.me.project_id }
  spec     { route_name = google_cloud_run_v2_service.site.name }
}
