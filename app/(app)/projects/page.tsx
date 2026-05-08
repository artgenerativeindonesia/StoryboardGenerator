'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LayoutGrid, List, Layers } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog'
import { RenameProjectDialog } from '@/components/projects/RenameProjectDialog'
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useArchiveProject,
} from '@/hooks/useProjects'
import { useUIStore } from '@/stores/uiStore'
import type { Project } from '@/types/database'
import type { CreateProjectInput } from '@/lib/validations/project'

type FilterTab = 'active' | 'archived'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export default function ProjectsPage() {
  const router = useRouter()
  const projectsView = useUIStore((s) => s.projectsView)
  const setProjectsView = useUIStore((s) => s.setProjectsView)

  const [filter, setFilter] = useState<FilterTab>('active')
  const [createOpen, setCreateOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const showArchived = filter === 'archived'
  const { data: projects = [], isLoading } = useProjects(showArchived)

  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const archiveProject = useArchiveProject()

  async function handleConfirmCreate(data: CreateProjectInput): Promise<void> {
    await createProject.mutateAsync(data)
    setCreateOpen(false)
  }

  async function handleConfirmRename(projectId: string, name: string): Promise<void> {
    await updateProject.mutateAsync({ id: projectId, name })
    setRenameTarget(null)
  }

  async function handleConfirmDelete(projectId: string): Promise<void> {
    await deleteProject.mutateAsync(projectId)
    setDeleteTarget(null)
  }

  function handleArchive(project: Project) {
    archiveProject.mutate({ id: project.id, archived: !project.is_archived })
  }

  const isGrid = projectsView === 'grid'

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-screen-2xl mx-auto w-full">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Projects
        </h1>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Filter tabs */}
        <div className="flex rounded-lg bg-white/5 p-0.5 gap-0.5">
          {(['active', 'archived'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={[
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                filter === tab
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/80',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg bg-white/5 p-0.5 gap-0.5">
          <button
            onClick={() => setProjectsView('grid')}
            title="Grid view"
            className={[
              'p-1.5 rounded-md transition-colors',
              isGrid ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70',
            ].join(' ')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setProjectsView('list')}
            title="List view"
            className={[
              'p-1.5 rounded-md transition-colors',
              !isGrid ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70',
            ].join(' ')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={showArchived ? 'No archived projects' : 'No projects yet'}
          description={
            showArchived
              ? 'Projects you archive will appear here.'
              : 'Create your first project to get started.'
          }
          action={
            !showArchived
              ? { label: 'New Project', onClick: () => setCreateOpen(true) }
              : undefined
          }
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${filter}-${isGrid ? 'grid' : 'list'}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={
              isGrid
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col gap-3'
            }
          >
            {projects.map((project) => (
              <motion.div key={project.id} variants={itemVariants} layout>
                <ProjectCard
                  project={project}
                  onClick={(p) => router.push(`/projects/${p.id}`)}
                  onRename={(p) => setRenameTarget(p)}
                  onDelete={(p) => setDeleteTarget(p)}
                  onArchive={handleArchive}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Dialogs ────────────────────────────────────────────────────── */}
      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onConfirm={handleConfirmCreate}
      />

      <RenameProjectDialog
        open={Boolean(renameTarget)}
        project={renameTarget}
        onOpenChange={(v) => !v && setRenameTarget(null)}
        onConfirm={handleConfirmRename}
      />

      <DeleteProjectDialog
        open={Boolean(deleteTarget)}
        project={deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
