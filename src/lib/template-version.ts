import { db, LocalTemplate } from './local-db'

export interface TemplateVersionCheck {
  hasUpdate: boolean
  localVersion: string | null
  remoteVersion: string
  changelog: string | null
}

export async function checkTemplateVersion(
  templateId: string,
  remoteVersion: string,
  remoteChangelog: string | null
): Promise<TemplateVersionCheck> {
  try {
    const localTemplate = await db.templates.get(templateId)

    if (!localTemplate) {
      return {
        hasUpdate: false,
        localVersion: null,
        remoteVersion,
        changelog: remoteChangelog,
      }
    }

    const hasUpdate = isVersionGreaterThan(remoteVersion, localTemplate.version)

    return {
      hasUpdate,
      localVersion: localTemplate.version,
      remoteVersion,
      changelog: remoteChangelog,
    }
  } catch (error) {
    console.error('Failed to check template version:', error)
    return {
      hasUpdate: false,
      localVersion: null,
      remoteVersion,
      changelog: remoteChangelog,
    }
  }
}

export async function checkActiveHabitTemplateVersion(
  sourceTemplateId: string,
  sourceTemplateVersion: string
): Promise<TemplateVersionCheck> {
  try {
    const template = await db.templates.get(sourceTemplateId)

    if (!template) {
      return {
        hasUpdate: false,
        localVersion: null,
        remoteVersion: sourceTemplateVersion,
        changelog: null,
      }
    }

    const hasUpdate = isVersionGreaterThan(template.version, sourceTemplateVersion)

    return {
      hasUpdate,
      localVersion: sourceTemplateVersion,
      remoteVersion: template.version,
      changelog: template.changelog,
    }
  } catch (error) {
    console.error('Failed to check active habit template version:', error)
    return {
      hasUpdate: false,
      localVersion: null,
      remoteVersion: sourceTemplateVersion,
      changelog: null,
    }
  }
}

export function isVersionGreaterThan(version1: string, version2: string): boolean {
  const v1 = version1.split('.').map(Number)
  const v2 = version2.split('.').map(Number)

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0
    const num2 = v2[i] || 0

    if (num1 > num2) {
      return true
    }
    if (num1 < num2) {
      return false
    }
  }

  return false
}

export async function updateLocalTemplate(
  templateId: string,
  templateData: LocalTemplate
): Promise<boolean> {
  try {
    await db.templates.put(templateData)
    return true
  } catch (error) {
    console.error('Failed to update local template:', error)
    return false
  }
}
