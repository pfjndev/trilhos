"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { AUTO_SAVE_CONFIG } from "@/lib/constants"

export interface UseAutoSaveOptions<T> {
  /** Data to save */
  data: T
  /** Whether auto-save is enabled */
  enabled: boolean
  /** Callback to perform the save */
  onSave: (data: T) => Promise<boolean>
  /** Callback when save fails */
  onError?: (error: Error) => void
  /** Interval between saves in milliseconds */
  intervalMs?: number
  /** Number of changes that trigger an immediate save */
  changeThreshold?: number
}

export interface UseAutoSaveReturn {
  /** Trigger a manual save */
  saveNow: () => Promise<void>
  /** Whether a save is currently in progress */
  isSaving: boolean
  /** Timestamp of last successful save */
  lastSaveTime: number
  /** Number of changes since last save */
  changesSinceLastSave: number
  /** Increment the change counter */
  recordChange: () => void
}

/**
 * Hook for auto-saving data at intervals or after threshold changes
 */
export function useAutoSave<T>({
  data,
  enabled,
  onSave,
  onError,
  intervalMs = AUTO_SAVE_CONFIG.INTERVAL_MS,
  changeThreshold = AUTO_SAVE_CONFIG.POINT_THRESHOLD,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState(0)
  const changeCountRef = useRef(0)
  const dataRef = useRef(data)

  // Keep data ref updated
  useEffect(() => {
    dataRef.current = data
  }, [data])

  const saveNow = useCallback(async () => {
    if (isSaving) return

    setIsSaving(true)
    try {
      const success = await onSave(dataRef.current)
      if (success) {
        setLastSaveTime(Date.now())
        changeCountRef.current = 0
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("Save failed"))
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, onSave, onError])

  const recordChange = useCallback(() => {
    changeCountRef.current++
  }, [])

  // Check if we should save based on time or threshold
  useEffect(() => {
    if (!enabled) return

    const shouldSave =
      (lastSaveTime > 0 && Date.now() - lastSaveTime >= intervalMs) ||
      changeCountRef.current >= changeThreshold

    if (shouldSave && !isSaving) {
      saveNow()
    }
  }, [enabled, lastSaveTime, intervalMs, changeThreshold, isSaving, saveNow])

  // Set up interval-based saving
  useEffect(() => {
    if (!enabled) return

    // Initialize last save time when enabling
    if (lastSaveTime === 0) {
      setLastSaveTime(Date.now())
    }

    const interval = setInterval(() => {
      if (changeCountRef.current > 0) {
        saveNow()
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [enabled, intervalMs, saveNow, lastSaveTime])

  return {
    saveNow,
    isSaving,
    lastSaveTime,
    changesSinceLastSave: changeCountRef.current,
    recordChange,
  }
}
