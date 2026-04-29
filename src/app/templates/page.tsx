'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { TemplateCard } from '@/components/template/TemplateCard'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { db, LocalTemplate } from '@/lib/local-db'

const categories = [
  'All',
  'Health',
  'Productivity',
  'Study',
  'Faith',
  'Finance',
  'Mental Wellness',
  'Self Care',
  'Developer Growth',
]

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<LocalTemplate[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/templates')
      const result = await response.json()

      if (result.success) {
        await db.templates.bulkPut(result.data)
        setTemplates(result.data)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
      const localTemplates = await db.templates.toArray()
      setTemplates(localTemplates)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateClick = (template: LocalTemplate) => {
    router.push(`/templates/${template.slug}`)
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <AppShell>
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Template Store
          </h1>
          <p className="text-gray-600">
            Choose your perfect 30-day challenge
          </p>
        </motion.div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>

        <div className="mb-6 flex overflow-x-auto pb-2">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-700 hover:bg-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
              <p className="text-gray-600">Loading templates...</p>
            </div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                No templates found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TemplateCard
                  title={template.title}
                  description={template.description}
                  category={template.category}
                  duration={template.durationDays}
                  isPremium={template.isPremium}
                  coverGradient={template.coverGradient}
                  difficulty={template.difficulty}
                  onClick={() => handleTemplateClick(template)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
