import React, { useState, useRef, useEffect } from 'react';
import { ProjectConfig } from '../../shared/types';
import { Layers, Plus, GitPullRequest, Sliders, MoreHorizontal, Power, Trash2, FolderGit2 } from 'lucide-react';
import { ProjectOverrideDialog } from './ProjectOverrideDialog';
import { COLOR_OPTIONS } from './ProjectSettingsDialog';

interface Props {
  projects: Record<string, ProjectConfig>;
  onUpdate: (key: string, updates: Partial<ProjectConfig>) => void;
  onDelete: (key: string) => void;
  onAdd: (project: ProjectConfig) => void;
  disabled: boolean;
  onCreateMR: (projectKey: string, targetBranch: string) => void;
  onOpenProjectSettings: (project: ProjectConfig) => void;
}

export function ProjectOverrides({
  projects,
  onUpdate,
  onDelete,
  onAdd,
  disabled,
  onCreateMR,
  onOpenProjectSettings,
}: Props) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number; projectKey: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const projectList = Object.values(projects).sort((a, b) => {
    return (b.lastVisited || 0) - (a.lastVisited || 0);
  });

  // Handle click outside of floating popover menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAnchor(null);
      }
    };
    const handleScrollOrResize = () => setMenuAnchor(null);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, []);

  const activeProject = menuAnchor ? projects[menuAnchor.projectKey] : null;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Header */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
            Projects ({projectList.length})
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-1 text-[11px] font-medium text-accent hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Project list */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[340px] overflow-y-auto overflow-x-hidden">
        {projectList.length === 0 ? (
          <div className="p-6 text-center text-slate-400 dark:text-slate-500">
            <FolderGit2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No projects saved yet.</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5">
              Navigate to any GitLab repository or click &quot;Add Project&quot;.
            </p>
          </div>
        ) : (
          projectList.map((project) => {
            const isCustomHex = project.colorTag?.startsWith('#');
            const colorMeta = !isCustomHex
              ? COLOR_OPTIONS.find((c) => c.id === project.colorTag) || COLOR_OPTIONS[0]
              : null;

            return (
              <div
                key={project.projectKey}
                className="group relative flex items-center justify-between p-3 hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Left info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${!isCustomHex ? colorMeta?.bg : ''}`}
                    style={isCustomHex ? { backgroundColor: project.colorTag } : undefined}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                        {project.customName || project.projectKey.split('/').slice(1).join('/') || project.projectKey}
                      </span>
                      {!project.enabled && (
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                      {project.projectKey}
                    </p>
                  </div>
                </div>

                {/* Right default view: Target Branch Badge */}
                <div className="flex items-center gap-2 shrink-0 transition-opacity duration-150 group-hover:opacity-0">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                    {project.targetBranch}
                  </span>
                </div>

                {/* Sliding Action Buttons on Hover */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/95 pl-3 py-1 rounded-lg backdrop-blur-xs shadow-xs border border-slate-200/80 dark:border-slate-800 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 ease-out z-10">
                  {/* Create MR */}
                  <button
                    type="button"
                    onClick={() => onCreateMR(project.projectKey, project.targetBranch)}
                    title="Create Merge Request"
                    className="p-1.5 rounded-md hover:bg-accent dark:hover:bg-accent text-accent dark:text-accent transition-colors cursor-pointer"
                  >
                    <GitPullRequest className="w-3.5 h-3.5" />
                  </button>

                  {/* Project Settings / Customization */}
                  <button
                    type="button"
                    onClick={() => onOpenProjectSettings(project)}
                    title="Project Settings (Color, Name, Branch)"
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  {/* Three-dots Menu Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      if (menuAnchor?.projectKey === project.projectKey) {
                        setMenuAnchor(null);
                      } else {
                        setMenuAnchor({
                          x: rect.right,
                          y: rect.bottom + 4,
                          projectKey: project.projectKey,
                        });
                      }
                    }}
                    title="More Options"
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Popover (Rendered with Fixed coords to prevent clipping by overflow-hidden) */}
      {menuAnchor && activeProject && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuAnchor.y}px`,
            left: `${Math.max(8, menuAnchor.x - 145)}px`,
          }}
          className="w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs text-slate-800 dark:text-slate-200"
        >
          <button
            type="button"
            onClick={() => {
              onUpdate(activeProject.projectKey, { enabled: !activeProject.enabled });
              setMenuAnchor(null);
            }}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <Power className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeProject.enabled ? 'Disable' : 'Enable'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onDelete(activeProject.projectKey);
              setMenuAnchor(null);
            }}
            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {isAddDialogOpen && (
        <ProjectOverrideDialog
          existingKeys={Object.keys(projects)}
          onClose={() => setIsAddDialogOpen(false)}
          onSave={onAdd}
        />
      )}
    </div>
  );
}
