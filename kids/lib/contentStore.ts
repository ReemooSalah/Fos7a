import { contentItems, type ContentItem } from './data'

const KEY = 'fos7a_content'

export function getAllContent(): ContentItem[] {
  if (typeof window === 'undefined') return contentItems
  try {
    const stored = localStorage.getItem(KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as ContentItem[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {}
  return contentItems
}

export function getContentById(id: string): ContentItem | undefined {
  return getAllContent().find(c => c.id === id)
}

export function saveAllContent(items: ContentItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function addContent(item: Omit<ContentItem, 'id'>): ContentItem {
  const items = getAllContent()
  const newItem: ContentItem = { ...item, id: 'c-' + Date.now().toString(36) }
  saveAllContent([newItem, ...items])
  return newItem
}

export function updateContent(id: string, updates: Partial<ContentItem>): void {
  saveAllContent(getAllContent().map(i => (i.id === id ? { ...i, ...updates } : i)))
}

export function deleteContent(id: string): void {
  saveAllContent(getAllContent().filter(i => i.id !== id))
}

export function resetContent(): void {
  localStorage.removeItem(KEY)
}

/** قراءة ملف كـ data URL لحفظه في localStorage (للملفات الصغيرة) */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
