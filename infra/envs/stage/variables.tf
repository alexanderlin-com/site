variable "project_id" { type = string }
variable "region"     { 
    type = string  
    default = "us-central1" 
    }



variable "github_repo"{
  description = "GitHub owner/repo, e.g. alexanderlin-com/site"
  type        = string
}
variable "repo_name"  { 
    type = string  
    default = "site" 
    } # Artifact Registry repo
