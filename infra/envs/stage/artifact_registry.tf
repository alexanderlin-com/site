resource "google_artifact_registry_repository" "docker" {
  project       = var.project_id
  location      = var.region
  repository_id = var.repo_name
  description   = "Docker images for site"
  format        = "DOCKER"
  depends_on    = [google_project_service.enabled]
}
output "artifact_repo" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repo_name}"
}
