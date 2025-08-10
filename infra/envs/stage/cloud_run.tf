resource "google_cloud_run_v2_service" "site" {
  name     = "site-stage"
  location = var.region

  template {
    containers {
      image = "gcr.io/cloudrun/hello"  # CI will replace this
      ports { container_port = 8080 }
    }
    # inside template { ... }
scaling {
  min_instance_count = 1
  max_instance_count = 5
}

  }

  # Let CI change the image without Terraform drift
  lifecycle {
    ignore_changes = [template[0].containers[0].image]
  }

  depends_on = [
    google_project_service.enabled,
    google_artifact_registry_repository.docker
  ]
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  location = var.region
  name     = google_cloud_run_v2_service.site.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "cloud_run_url" { value = google_cloud_run_v2_service.site.uri }

