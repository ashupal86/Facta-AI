"use client"

import * as React from "react"
import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getApi } from "@/helpers/api"
import { apiEndPoints } from "@/helpers/apiEndpoints"
import { toast } from "sonner"
import Loading from "@/components/common/loading"
import { AnalysisLoading } from "./analysis-loading"
import { AnalysisApiResponse } from "@/types"
import ChatMessage from "@/components/ChatMessage"
import ChatInputFooter from "@/components/ChatInputFooter"
import MaterialIcon from "@/components/common/material-icon"

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const jobId = Number(id)
  const router = useRouter()
  const [responseData, setResponseData] = useState<AnalysisApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAnalysis = useCallback(async () => {
    try {
      const response = await getApi(`${apiEndPoints.analysis.status(jobId)}`)

      if (response.status !== 200) {
        console.error("Failed to fetch analysis data", {
          response: response.data,
          status: response.status,
        })
        toast.error("Failed to fetch analysis data")
        setError("Failed to fetch analysis data")
        setIsLoading(false)
        return
      }

      setResponseData(response.data)
      setIsLoading(false)

      if (response.data.data.analysis.status === "pending" || response.data.data.analysis.status === "running") {
        startPolling()
      } else {
        stopPolling()
      }
    } catch (error) {
      console.error("Error fetching analysis:", error)
      setError("Failed to fetch analysis data")
      setIsLoading(false)
    }
  }, [jobId])

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    pollingIntervalRef.current = setInterval(() => {
      fetchAnalysis()
    }, 2000)
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  useEffect(() => {
    if (!Number.isFinite(jobId)) {
      setError("Invalid job id")
      setIsLoading(false)
      return
    }

    fetchAnalysis()

    return () => {
      stopPolling()
    }
  }, [jobId])

  const handleSendMessage = (message: string) => {
    // For now, just show a toast - in the future this could start a new analysis
    toast.info("This is a completed analysis. Create a new analysis to ask more questions.")
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading variant="ring" />
      </div>
    )
  }

  if (error || !responseData) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center max-w-md">
          <MaterialIcon icon="error" className="text-4xl text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Analysis Not Found</h2>
          <p className="text-secondary text-sm">{error || "Analysis not found"}</p>
        </div>
      </div>
    )
  }

  if (responseData.data.analysis.status === "pending" || responseData.data.analysis.status === "running") {
    return <AnalysisLoading progress={responseData.data.metadata.progress || 0} />
  }

  const analysis = responseData.data.analysis
  const result = analysis.result

  // Determine user query from scrapedText or URL
  const userQuery = analysis.scrapedText || "Analyze this content"

  return (
    <>
      <section className="flex-1 overflow-y-auto space-y-6 pt-6 pr-2 -mr-2">
        {/* User's initial query */}
        <ChatMessage type="user" content={userQuery} />

        {/* AI Response with analysis card */}
        <ChatMessage
          type="ai"
          content="Here's the fact-check analysis:"
          card={
            <div className="bg-surface rounded-lg p-4">
              <h3 className="font-bold mb-1">{result.title}</h3>
              <p className="text-secondary text-sm mb-3">{result.description}</p>

              {/* Credibility Score */}
              {result.credibilityScore !== undefined && (
                <div className="mb-3 p-3 bg-background rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MaterialIcon icon="shield_check" className="text-primary" />
                    <span className="font-semibold text-sm">Credibility Score</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${result.credibilityScore}%` }}
                      />
                    </div>
                    <span className="font-bold text-lg">{result.credibilityScore}%</span>
                  </div>
                  <p className="text-xs text-secondary mt-2">
                    {result.credibilityScore > 75
                      ? "Highly credible"
                      : result.credibilityScore > 50
                        ? "Moderately credible"
                        : "Low credibility"}
                  </p>
                </div>
              )}

              {/* Sources */}
              {result.sources && result.sources.length > 0 && (
                <div className="flex justify-end">
                  <span className="text-xs font-medium bg-background text-secondary px-3 py-1.5 rounded-full">
                    {result.sources.length} source{result.sources.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          }
        />

        {/* Show sources if available */}
        {result.sources && result.sources.length > 0 && (
          <ChatMessage
            type="ai"
            content=""
            card={
              <div className="bg-surface rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MaterialIcon icon="link" className="text-primary" />
                  <h4 className="font-semibold text-sm">Sources</h4>
                </div>
                <div className="space-y-2">
                  {result.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-background hover:bg-background/80 rounded-lg transition-colors text-xs"
                    >
                      <MaterialIcon icon="open_in_new" className="text-primary flex-shrink-0" />
                      <span className="truncate">{source}</span>
                    </a>
                  ))}
                </div>
              </div>
            }
          />
        )}
      </section>

      <ChatInputFooter
        onSendMessage={handleSendMessage}
        placeholder="Ask a follow-up question..."
      />
    </>
  )
}