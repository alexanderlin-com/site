# OPS – AlexanderLin.com

## Health checks
- Uptime endpoint: `https://alexanderlin.com/api/healthz` → **200 OK**
- Cloud Run service: `site-stage` in `us-central1`

## Rollback fast
```bash
# See revisions & traffic
gcloud run services describe site-stage --region us-central1 --format="yaml(status.traffic,status.latestReadyRevisionName)"
# Pin traffic 100% to last good revision
gcloud run services update-traffic site-stage --region us-central1 --to-revisions REVISION_NAME=100
