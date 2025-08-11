resource "google_project_service" "dns" {
    project             = var.project_id
    service             = "dns.googleapis.com"
    disable_on_destroy  = false
}
