data "google_project" "me" {}

# Apex: alexanderlin.com → site-stage
resource "google_cloud_run_domain_mapping" "apex" {
  name     = "alexanderlin.com"
  location = var.region
  metadata { namespace = data.google_project.me.project_id }
  spec     { route_name = google_cloud_run_v2_service.site.name }
}

# Optional: www.alexanderlin.com → site-stage (we'll redirect to apex in app)
resource "google_cloud_run_domain_mapping" "www" {
  name     = "www.alexanderlin.com"
  location = var.region
  metadata { namespace = data.google_project.me.project_id }
  spec     { route_name = google_cloud_run_v2_service.site.name }
}
