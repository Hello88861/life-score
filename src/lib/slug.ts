export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[\s\u4e00-\u9fa5]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'post'
  return `${base}-${Date.now().toString(36)}`
}
