import { useRef, useState } from 'react'
import { ImageUp, X } from 'lucide-react'

function DragDropUpload({
  label = 'Upload an image',
  hint = '',
  previewUrl = '',
  onFileSelected = () => {},
  onRemove = () => {},
  accept = 'image/png,image/jpeg,image/jpg',
}) {
  const inputRef = useRef(null)
  const [isDragActive, setIsDragActive] = useState(false)

  // The click-to-browse path gets this filtering for free from the native
  // file picker's `accept` attribute; a drop bypasses that picker entirely,
  // so it needs the same check applied by hand.
  const matchesAccept = (file) => {
    const patterns = accept.split(',').map((pattern) => pattern.trim()).filter(Boolean)

    if (patterns.length === 0) {
      return true
    }

    return patterns.some((pattern) => {
      if (pattern.endsWith('/*')) {
        return file.type.startsWith(pattern.slice(0, -1))
      }

      if (pattern.startsWith('.')) {
        return file.name.toLowerCase().endsWith(pattern.toLowerCase())
      }

      return file.type === pattern
    })
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragActive(false)
    const file = event.dataTransfer.files?.[0]

    if (file && matchesAccept(file)) {
      onFileSelected(file)
    }
  }

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0]

    if (file) {
      onFileSelected(file)
    }

    event.target.value = ''
  }

  return (
    <div
      className={`drag-drop-upload${isDragActive ? ' drag-drop-upload--active' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragActive(true)
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileInputChange}
      />
      {previewUrl ? (
        <div className="drag-drop-upload__preview">
          <img src={previewUrl} alt="" />
          <button
            type="button"
            className="drag-drop-upload__remove"
            onClick={onRemove}
            aria-label="Remove image"
          >
            <X size={14} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="drag-drop-upload__dropzone"
          onClick={() => inputRef.current?.click()}
        >
          <ImageUp size={20} strokeWidth={1.75} aria-hidden="true" />
          <span className="drag-drop-upload__label">{label}</span>
          {hint ? <span className="drag-drop-upload__hint">{hint}</span> : null}
        </button>
      )}
    </div>
  )
}

export default DragDropUpload
