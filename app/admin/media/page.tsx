"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSiteStore } from "@/lib/stores/siteStore";
import type { Media, MediaFolder } from "@/lib/db";
import {
  Upload, Trash2, Copy, Check, Folder, FolderPlus, ChevronRight, Home, Music,
} from "lucide-react";

function isAudio(m: Media) {
  return m.mimeType.startsWith("audio/") || /\.(mp3|m4a|wav|ogg)$/i.test(m.originalName);
}

export default function MediaPage() {
  const { currentSite, loaded } = useSiteStore();
  const [files, setFiles] = useState<Media[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    if (!currentSite) return;
    setLoading(true);
    const folderParam = currentFolderId ?? "root";
    const [f, fo] = await Promise.all([
      fetch(`/api/admin/media?siteId=${currentSite.id}&folderId=${folderParam}`).then((r) => r.json()),
      fetch(`/api/admin/media/folders?siteId=${currentSite.id}`).then((r) => r.json()),
    ]);
    setFiles(Array.isArray(f) ? f : []);
    setFolders(Array.isArray(fo) ? fo : []);
    setLoading(false);
  }

  useEffect(() => {
    if (!currentSite) { setLoading(false); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSite, currentFolderId]);

  const childFolders = useMemo(
    () => folders.filter((f) => (f.parentId ?? null) === currentFolderId),
    [folders, currentFolderId]
  );

  const breadcrumbs = useMemo(() => {
    const trail: MediaFolder[] = [];
    let id = currentFolderId;
    while (id) {
      const folder = folders.find((f) => f.id === id);
      if (!folder) break;
      trail.unshift(folder);
      id = folder.parentId ?? null;
    }
    return trail;
  }, [folders, currentFolderId]);

  async function upload(fileList: FileList) {
    if (!currentSite) return;
    setUploading(true);
    for (const file of Array.from(fileList)) {
      const form = new FormData();
      form.append("file", file);
      form.append("siteId", currentSite.id);
      if (currentFolderId) form.append("folderId", currentFolderId);
      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      if (res.ok) {
        const media = await res.json();
        setFiles((prev) => [media, ...prev]);
      } else {
        const err = await res.json();
        setUploadError(err.error ?? "Upload mislukt");
        setTimeout(() => setUploadError(null), 4000);
      }
    }
    setUploading(false);
  }

  async function createFolder() {
    if (!currentSite || !newFolderName.trim()) return;
    const res = await fetch("/api/admin/media/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteId: currentSite.id,
        name: newFolderName.trim(),
        parentId: currentFolderId,
      }),
    });
    if (res.ok) {
      const folder = await res.json();
      setFolders((fs) => [...fs, folder]);
      setNewFolderName("");
      setShowNewFolder(false);
    }
  }

  async function deleteFolder(id: string) {
    if (!confirm("Map verwijderen? Bestanden gaan naar de bovenliggende map.")) return;
    await fetch(`/api/admin/media/folders/${id}`, { method: "DELETE" });
    if (currentFolderId === id) setCurrentFolderId(null);
    await load();
  }

  async function deleteMedia(id: string) {
    if (!confirm("Bestand verwijderen?")) return;
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    setFiles((f) => f.filter((m) => m.id !== id));
  }

  async function moveToFolder(mediaId: string, folderId: string | null) {
    await fetch(`/api/admin/media/${mediaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    });
    setFiles((fs) => fs.filter((m) => m.id !== mediaId));
  }

  function copyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  if (!loaded) return <div className="text-stone-400 text-sm p-6 animate-pulse">Laden...</div>;
  if (!currentSite) return <p className="text-stone-500">Kies eerst een site.</p>;

  return (
    <div className="max-w-5xl mx-auto">
      {uploadError && (
        <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {uploadError}
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Media</h1>
          <p className="text-stone-500 text-sm">Afbeeldingen, audio en mappen</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-1.5 border border-stone-300 hover:border-amber-400 px-3 py-2 rounded-lg text-sm"
          >
            <FolderPlus size={16} /> Nieuwe map
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            <Upload size={16} />{uploading ? "Uploaden..." : "Uploaden"}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,audio/mpeg,audio/mp3,audio/mp4,audio/wav,audio/ogg,.mp3,.m4a,.wav"
            className="hidden"
            onChange={(e) => e.target.files && upload(e.target.files)}
          />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-4 flex-wrap">
        <button
          type="button"
          onClick={() => setCurrentFolderId(null)}
          className={cnBtn(!currentFolderId)}
        >
          <Home size={14} /> Hoofdmap
        </button>
        {breadcrumbs.map((f) => (
          <span key={f.id} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-stone-300" />
            <button type="button" onClick={() => setCurrentFolderId(f.id)} className={cnBtn(currentFolderId === f.id)}>
              {f.name}
            </button>
          </span>
        ))}
      </div>

      {showNewFolder && (
        <div className="bg-white border border-stone-200 rounded-xl p-3 mb-4 flex gap-2">
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createFolder()}
            placeholder="Naam van de map..."
            className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm"
          />
          <button onClick={createFolder} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm">Aanmaken</button>
          <button onClick={() => setShowNewFolder(false)} className="px-3 text-stone-500 text-sm">Annuleren</button>
        </div>
      )}

      <div
        className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center mb-4 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); e.dataTransfer.files && upload(e.dataTransfer.files); }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload size={24} className="mx-auto text-stone-300 mb-2" />
        <p className="text-stone-400 text-sm">Sleep bestanden hierheen</p>
        <p className="text-stone-300 text-xs mt-1">Afbeeldingen max 8MB · Audio (MP3/M4A) max 32MB</p>
      </div>

      {loading ? (
        <p className="text-stone-400 text-sm">Laden...</p>
      ) : (
        <>
          {childFolders.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {childFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="group flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-3 cursor-pointer hover:bg-amber-100"
                  onClick={() => setCurrentFolderId(folder.id)}
                >
                  <Folder size={20} className="text-amber-600 shrink-0" />
                  <span className="text-sm font-medium text-stone-800 truncate flex-1">{folder.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {files.map((file) => (
              <div key={file.id} className="group relative aspect-square bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
                {isAudio(file) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
                    <Music size={32} className="text-amber-600" />
                    <p className="text-[10px] text-stone-500 text-center line-clamp-2">{file.originalName}</p>
                  </div>
                ) : (
                  <img src={file.url} alt={file.alt} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 p-2">
                  <div className="flex gap-2">
                    <button onClick={() => copyUrl(file.id, file.url)} className="p-1.5 bg-white rounded-lg">
                      {copiedId === file.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                    <button onClick={() => deleteMedia(file.id)} className="p-1.5 bg-white rounded-lg text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {folders.length > 0 && (
                    <select
                      className="text-[10px] rounded px-1 py-0.5 max-w-full"
                      defaultValue=""
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") return;
                        moveToFolder(file.id, v === "root" ? null : v);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Verplaats naar...</option>
                      <option value="root">Hoofdmap</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
            {files.length === 0 && childFolders.length === 0 && (
              <div className="col-span-full text-center py-8 text-stone-400">Deze map is leeg</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function cnBtn(active: boolean) {
  return `flex items-center gap-1 px-2 py-1 rounded-lg ${active ? "bg-amber-100 text-amber-900 font-medium" : "text-stone-600 hover:bg-stone-100"}`;
}
