"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Image as ImageIcon, Upload, X, Folder, ChevronRight, Home, Music } from "lucide-react";
import { useSiteStore } from "@/lib/stores/siteStore";
import type { Media, MediaFolder } from "@/lib/db";

interface Props {
  label?: string;
  url?: string;
  onSelect: (media: Media) => void;
  onClear?: () => void;
  acceptAudio?: boolean;
  folderId?: string | null;
}

function isAudio(m: Media) {
  return m.mimeType.startsWith("audio/") || /\.(mp3|m4a|wav|ogg)$/i.test(m.originalName);
}

export function MediaPicker({ label = "Afbeelding", url, onSelect, onClear, acceptAudio, folderId }: Props) {
  const { currentSite } = useSiteStore();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<Media[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [browseFolderId, setBrowseFolderId] = useState<string | null>(folderId ?? null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !currentSite) return;
    setBrowseFolderId(folderId ?? null);
  }, [open, currentSite, folderId]);

  useEffect(() => {
    if (!open || !currentSite) return;
    setLoading(true);
    const folderParam = browseFolderId ?? "root";
    Promise.all([
      fetch(`/api/admin/media?siteId=${currentSite.id}&folderId=${folderParam}`).then((r) => r.json()),
      fetch(`/api/admin/media/folders?siteId=${currentSite.id}`).then((r) => r.json()),
    ])
      .then(([f, fo]) => {
        setFiles(Array.isArray(f) ? f : []);
        setFolders(Array.isArray(fo) ? fo : []);
      })
      .finally(() => setLoading(false));
  }, [open, currentSite, browseFolderId]);

  const childFolders = useMemo(
    () => folders.filter((f) => (f.parentId ?? null) === browseFolderId),
    [folders, browseFolderId]
  );

  const visibleFiles = useMemo(
    () => (acceptAudio ? files.filter(isAudio) : files.filter((f) => !isAudio(f))),
    [files, acceptAudio]
  );

  async function upload(list: FileList) {
    if (!currentSite) return;
    setUploading(true);
    for (const file of Array.from(list)) {
      const form = new FormData();
      form.append("file", file);
      form.append("siteId", currentSite.id);
      if (browseFolderId) form.append("folderId", browseFolderId);
      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      if (res.ok) {
        const media = await res.json();
        if (acceptAudio && !isAudio(media)) continue;
        if (!acceptAudio && isAudio(media)) continue;
        setFiles((f) => [media, ...f]);
        onSelect(media);
        setOpen(false);
      }
    }
    setUploading(false);
  }

  const accept = acceptAudio
    ? "audio/mpeg,audio/mp3,audio/mp4,audio/wav,audio/ogg,.mp3,.m4a,.wav"
    : "image/*";

  return (
    <div>
      {label && <p className="text-xs font-medium text-stone-600 mb-1">{label}</p>}
      {url ? (
        <div className="relative rounded-lg overflow-hidden border border-stone-200 mb-2">
          {acceptAudio ? (
            <div className="p-3 bg-stone-50 flex items-center gap-2">
              <Music size={18} className="text-amber-600 shrink-0" />
              <audio src={url} controls className="w-full h-8" />
            </div>
          ) : (
            <img src={url} alt="" className="w-full h-28 object-cover" />
          )}
          <div className="absolute top-1.5 right-1.5 flex gap-1">
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="p-1 bg-white/90 rounded text-stone-600 hover:text-red-600"
                title="Verwijderen"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="h-20 rounded-lg border border-dashed border-stone-300 bg-stone-50 flex items-center justify-center text-stone-400 text-xs mb-2">
          {acceptAudio ? "Geen audio" : "Geen afbeelding"}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-xs py-1.5 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50"
      >
        Kiezen uit bibliotheek
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
              <p className="font-semibold text-stone-800 text-sm">Mediabibliotheek</p>
              <button type="button" onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X size={16} />
              </button>
            </div>

            <div className="px-3 py-2 border-b border-stone-100 flex items-center gap-1 text-xs flex-wrap">
              <button
                type="button"
                onClick={() => setBrowseFolderId(null)}
                className={`flex items-center gap-1 px-2 py-1 rounded ${!browseFolderId ? "bg-amber-100 text-amber-900" : "text-stone-600 hover:bg-stone-100"}`}
              >
                <Home size={12} /> Hoofdmap
              </button>
              {browseFolderId && (
                <span className="flex items-center gap-1 text-stone-500">
                  <ChevronRight size={12} />
                  {folders.find((f) => f.id === browseFolderId)?.name ?? "Map"}
                </span>
              )}
            </div>

            <div className="p-3 border-b border-stone-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg disabled:opacity-60"
              >
                <Upload size={13} />
                {uploading ? "Uploaden..." : "Uploaden"}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => e.target.files && upload(e.target.files)}
              />
              <p className="text-[11px] text-stone-400">
                {acceptAudio ? "MP3, M4A · max 32MB" : "JPG, PNG, WebP · max 8MB"}
              </p>
            </div>

            <div className="p-3 overflow-y-auto flex-1">
              {loading ? (
                <p className="text-sm text-stone-400">Laden...</p>
              ) : (
                <>
                  {childFolders.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {childFolders.map((folder) => (
                        <button
                          key={folder.id}
                          type="button"
                          onClick={() => setBrowseFolderId(folder.id)}
                          className="flex items-center gap-2 px-2 py-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-left"
                        >
                          <Folder size={14} className="text-amber-600 shrink-0" />
                          <span className="text-xs font-medium truncate">{folder.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {visibleFiles.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 text-sm">
                      {acceptAudio ? <Music size={28} className="mx-auto mb-2 opacity-40" /> : <ImageIcon size={28} className="mx-auto mb-2 opacity-40" />}
                      Geen {acceptAudio ? "audio" : "afbeeldingen"} in deze map
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {visibleFiles.map((file) => (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => {
                            onSelect(file);
                            setOpen(false);
                          }}
                          className="aspect-square rounded-lg overflow-hidden border border-stone-200 hover:border-amber-500 hover:ring-2 hover:ring-amber-200 flex flex-col items-center justify-center p-1"
                        >
                          {isAudio(file) ? (
                            <>
                              <Music size={24} className="text-amber-600" />
                              <span className="text-[9px] text-stone-500 mt-1 line-clamp-2 text-center">{file.originalName}</span>
                            </>
                          ) : (
                            <img src={file.url} alt={file.alt} className="w-full h-full object-cover" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
