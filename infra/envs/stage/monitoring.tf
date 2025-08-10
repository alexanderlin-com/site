# 1) Email channel (one-time verification email will arrive)
resource "google_monitoring_notification_channel" "email" {
  type         = "email"
  display_name = "Ops Email"
  labels = {
    email_address = var.alert_email
  }
}

# 2) Uptime check against apex /api/healthz
resource "google_monitoring_uptime_check_config" "site" {
  display_name     = "alexanderlin.com health"
  timeout          = "10s"
  period           = "60s"
  selected_regions = ["USA", "EUROPE", "ASIA_PACIFIC"]

  http_check {
    request_method = "GET"
    use_ssl        = true
    validate_ssl   = true
    port           = 443
    path           = "/api/healthz"
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = "alexanderlin.com"
    }
  }
}

# 3) Alert if the check fails for > 1 minute
resource "google_monitoring_alert_policy" "uptime_down" {
  display_name = "UPTIME DOWN: alexanderlin.com"
  severity     = "CRITICAL"
  combiner     = "OR"

  documentation {
    content   = "Runbook: https://github.com/alexanderlin-com/site/blob/main/ops/OPS.md#uptime\nCheck Cloud Run revisions/traffic, last deploy, logs."
    mime_type = "text/markdown"
  }

  conditions {
    display_name = "Uptime failed > 2m"
    condition_threshold {
      # BOOL metric: 1 = up, 0 = down
      filter          = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND resource.type=\"uptime_url\" AND resource.label.\"host\"=\"alexanderlin.com\""
      comparison      = "COMPARISON_LT"
      threshold_value = 1
      duration        = "120s"

      # Align per-series only (BOOL-safe)
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_NEXT_OLDER"
      }

      # Fire if ANY series violates (i.e., any region is down)
      trigger { count = 1 }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]
}

# Alert if Cloud Run returns >=5 total 5xx in 5 minutes (sum across regions/revisions)
resource "google_monitoring_alert_policy" "cloudrun_5xx" {
  display_name = "5XX SPIKE: site-stage"
  severity     = "WARNING"
  combiner     = "OR"

  documentation {
    content   = "Runbook: https://github.com/alexanderlin-com/site/blob/main/ops/OPS.md#5xx\nInspect Cloud Run logs, recent deploys; rollback if needed."
    mime_type = "text/markdown"
  }

  conditions {
    display_name = ">=5 errors over 5m"
    condition_threshold {
      filter          = "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND resource.label.\"service_name\"=\"site-stage\" AND metric.label.\"response_code_class\"=\"5xx\""
      comparison      = "COMPARISON_GT"
      threshold_value = 4
      duration        = "300s"

      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_DELTA"   # convert cumulative counter to per-minute deltas
        cross_series_reducer = "REDUCE_SUM"
        group_by_fields      = ["resource.service_name"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]
}
