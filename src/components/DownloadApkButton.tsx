"use client"

import { useEffect, useState } from "react"

export function DownloadApkButton() {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/apk/latest")
      .then(res => res.json())
      .then(data => setUrl(data.url))
      .catch(() => setUrl(null))
  }, [])

  if (!url) return null

  return (
    <a href={url}
        download 
        className="rounded-xl border border-slate-300 px-5 py-3 text-slate-700 transition-colors hover:bg-slate-100">
      Baixar para Android
    </a>
  )
}
