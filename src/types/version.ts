export interface AppVersion {
  app_version: string
  api_version: string
  minimum_supported_app_version: string
  latest_app_version: string
  force_update: boolean
  message: string | null
}

export interface AppMeta {
  local_db_schema_version: number
  app_version: string
  last_sync_at: string | null
  last_template_sync_at: string | null
  last_successful_push_at: string | null
}

export const LOCAL_DB_SCHEMA_VERSION = 1
export const CURRENT_API_VERSION = '1'
