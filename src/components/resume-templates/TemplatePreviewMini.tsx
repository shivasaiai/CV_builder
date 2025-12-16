import React from "react";

interface TemplatePreviewMiniProps {
  title: string;
  categoryLabel?: string;
}

/**
 * Extremely lightweight visual preview used only on the templates listing page.
 * Designed to stay very small in the bundle (< ~15kb once built and minified).
 */
const TemplatePreviewMini: React.FC<TemplatePreviewMiniProps> = ({
  title,
  categoryLabel,
}) => {
  return (
    <div className="relative w-full aspect-[3/4] rounded-xl border bg-white shadow-sm overflow-hidden">
      {/* Header strip */}
      <div className="h-6 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500" />

      {/* Body layout skeleton */}
      <div className="p-3 space-y-2 text-[10px]">
        <div className="h-3 w-3/4 bg-gray-200 rounded-sm" />
        <div className="flex gap-2">
          <div className="w-1/3 space-y-1">
            <div className="h-2 w-5/6 bg-gray-100 rounded-sm" />
            <div className="h-2 w-4/5 bg-gray-100 rounded-sm" />
            <div className="h-2 w-3/4 bg-gray-100 rounded-sm" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-2 w-full bg-gray-100 rounded-sm" />
            <div className="h-2 w-11/12 bg-gray-100 rounded-sm" />
            <div className="h-2 w-10/12 bg-gray-100 rounded-sm" />
            <div className="h-2 w-9/12 bg-gray-100 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Template name footer */}
      <div className="absolute bottom-0 inset-x-0 px-2 py-1 bg-white/90 border-t text-[10px] flex items-center justify-between">
        <span className="font-medium truncate" title={title}>
          {title}
        </span>
        {categoryLabel && (
          <span className="text-[9px] text-gray-500 ml-2 truncate">
            {categoryLabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default TemplatePreviewMini;


