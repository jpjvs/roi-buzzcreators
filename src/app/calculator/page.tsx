"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calculator, Users, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CampaignParams } from "@/dtos/campaign"
import {
  getRemainingSimulations,
  getUserEmail,
  hasEmailAccess,
  hasReachedDailyLimit,
} from "@/services/access-control"

interface Creator {
  username: string
  id: string
}

export default function CalculatorPage() {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const [remainingSimulations, setRemainingSimulations] = useState(5)
  const [reachedLimit, setReachedLimit] = useState(false)

  const [campaignParams, setCampaignParams] = useState<CampaignParams>({
    ticketMedio: 1000,
    taxaConversao: 0.5,
    cpv: 0.02,
    engajamento: 8,
  })

  const [creators, setCreators] = useState<Creator[]>([])
  const [creatorInput, setCreatorInput] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const resolveAccess = async () => {
      if (!hasEmailAccess()) {
        router.push("/")
        return
      }

      const email = getUserEmail()
      if (!email) {
        router.push("/")
        return
      }

      const hasReached = hasReachedDailyLimit(email)
      const remaining = getRemainingSimulations(email)

      await Promise.resolve()
      if (isCancelled) return

      setReachedLimit(hasReached)
      setRemainingSimulations(remaining)
      setHasAccess(true)
    }

    resolveAccess()

    return () => {
      isCancelled = true
    }
  }, [router])

  const handleAddCreator = () => {
    if (!creatorInput.trim()) return

    // Remove @ if present
    const username = creatorInput.trim().replace("@", "")

    // Check if already added
    if (creators.some((c) => c.username.toLowerCase() === username.toLowerCase())) {
      return
    }

    // Check daily limit (5 creators max)
    if (creators.length >= 5) {
      return
    }

    setCreators([...creators, { username, id: Date.now().toString() }])
    setCreatorInput("")
  }

  const handleRemoveCreator = (id: string) => {
    setCreators(creators.filter((c) => c.id !== id))
  }

  const handleCalculate = () => {
    if (creators.length === 0) return

    const email = getUserEmail()
    if (email && hasReachedDailyLimit(email)) {
      return
    }

    setIsCalculating(true)

    // Store params and creators for results page
    localStorage.setItem("campaignParams", JSON.stringify(campaignParams))
    localStorage.setItem("creators", JSON.stringify(creators))

    // Navigate to results
    router.push("/results")
  }

  if (!hasAccess) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            <span className="font-semibold text-lg">Buzzcreators</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Simule o retorno das suas campanhas com influenciadores
          </h1>
          <p className="text-muted-foreground text-lg">
            Defina os parâmetros globais da campanha e adicione os perfis dos criadores
          </p>
          {!reachedLimit && (
            <p className="text-sm text-muted-foreground mt-2">
              Simulações restantes hoje: <strong>{remainingSimulations}</strong>
            </p>
          )}
        </div>

        {reachedLimit && (
          <Alert className="mb-8 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <AlertDescription>
              Você atingiu o limite de 5 simulações por dia. Volte amanhã para fazer novas simulações ou conheça o
              Buzzcreators para análises ilimitadas.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Campaign Parameters */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="h-5 w-5" />
                <CardTitle>Dados da Sua Campanha</CardTitle>
              </div>
              <CardDescription>Defina os parâmetros globais da campanha</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticketMedio">Ticket Médio (R$)</Label>
                <Input
                  id="ticketMedio"
                  type="number"
                  value={campaignParams.ticketMedio}
                  onChange={(e) =>
                    setCampaignParams({
                      ...campaignParams,
                      ticketMedio: Number(e.target.value),
                    })
                  }
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">Qual o valor médio do seu produto?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxaConversao">Taxa de Conversão (%)</Label>
                <Input
                  id="taxaConversao"
                  type="number"
                  value={campaignParams.taxaConversao}
                  onChange={(e) =>
                    setCampaignParams({
                      ...campaignParams,
                      taxaConversao: Number(e.target.value),
                    })
                  }
                  min="0"
                  max="100"
                  step="0.1"
                />
                <p className="text-xs text-muted-foreground">
                  Quantas vendas você espera a cada 100 views nos Stories?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpv">CPV - Custo por View (R$)</Label>
                <Input
                  id="cpv"
                  type="number"
                  value={campaignParams.cpv}
                  onChange={(e) =>
                    setCampaignParams({
                      ...campaignParams,
                      cpv: Number(e.target.value),
                    })
                  }
                  min="0"
                  step="0.001"
                />
                <p className="text-xs text-muted-foreground">Custo estimado por visualização</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="engajamento">Engajamento dos Stories (%)</Label>
                <Input
                  id="engajamento"
                  type="number"
                  value={campaignParams.engajamento}
                  onChange={(e) =>
                    setCampaignParams({
                      ...campaignParams,
                      engajamento: Number(e.target.value),
                    })
                  }
                  min="0"
                  max="100"
                  step="0.1"
                />
                <p className="text-xs text-muted-foreground">Engajamento médio dos Stories do influenciador</p>
              </div>
            </CardContent>
          </Card>

          {/* Add Creators */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-5 w-5" />
                <CardTitle>Adicione os Criadores</CardTitle>
              </div>
              <CardDescription>Liste os perfis dos influenciadores para simular</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="creators">Perfis dos influenciadores</Label>
                <div className="flex gap-2">
                  <Input
                    id="creators"
                    placeholder="@creator1, @creator2, @creator3"
                    value={creatorInput}
                    onChange={(e) => setCreatorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddCreator()
                      }
                    }}
                  />
                  <Button onClick={handleAddCreator} disabled={creators.length >= 5 || !creatorInput.trim()}>
                    Adicionar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Digite o @ do perfil ou adicione um por linha</p>
              </div>

              {creators.length > 0 && (
                <div className="space-y-2">
                  <Label>Criadores adicionados ({creators.length}/5)</Label>
                  <div className="space-y-2">
                    {creators.map((creator) => (
                      <div
                        key={creator.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50"
                      >
                        <span className="font-medium">@{creator.username}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveCreator(creator.id)}>
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {creators.length >= 5 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Limite máximo de 5 perfis por simulação atingido.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calculate Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleCalculate}
            disabled={creators.length === 0 || isCalculating || reachedLimit}
            className="px-12"
          >
            {isCalculating ? "Calculando..." : "Calcular ROI"}
          </Button>

          {creators.length === 0 && !reachedLimit && (
            <p className="text-sm text-muted-foreground mt-3">Adicione pelo menos um criador para calcular</p>
          )}

          {reachedLimit && <p className="text-sm text-destructive mt-3">Limite diário de simulações atingido</p>}
        </div>
      </div>
    </div>
  )
}
