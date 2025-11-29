"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calculator, TrendingUp, Target } from "lucide-react"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setIsSubmitting(true)

    try {
      // Submit email to CRM
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "roi-calculator-homepage",
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store email in localStorage for access control
        localStorage.setItem("userEmail", email)
        localStorage.setItem("emailSubmittedAt", new Date().toISOString())

        // Navigate to calculator
        router.push("/calculator")
      }
    } catch (error) {
      console.error("[v0] Error submitting email:", error)

      // Even if CRM submission fails, allow user to proceed
      localStorage.setItem("userEmail", email)
      localStorage.setItem("emailSubmittedAt", new Date().toISOString())
      router.push("/calculator")
    } finally {
      setIsSubmitting(false)
    }
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Ferramenta gratuita de ROI
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Calcule o ROI das suas campanhas com influenciadores
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 text-balance max-w-2xl mx-auto">
            Descubra o potencial de retorno das suas parcerias com criadores de conteúdo. Simule resultados baseados em
            dados reais do Instagram.
          </p>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 text-base"
              />
              <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 px-8 font-semibold">
                {isSubmitting ? "Acessando..." : "Começar Simulação"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Acesso gratuito. Sem necessidade de cartão de crédito.</p>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-4">
              <Calculator className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Cálculos Precisos</h3>
            <p className="text-muted-foreground text-sm">
              Estimativas baseadas em métricas reais de engajamento e alcance do Instagram
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-4">
              <TrendingUp className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Múltiplos Perfis</h3>
            <p className="text-muted-foreground text-sm">
              Compare até 5 criadores simultaneamente para otimizar seu investimento
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-4">
              <Target className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Resultados Instantâneos</h3>
            <p className="text-muted-foreground text-sm">Veja projeções de vendas, receita e ROI em segundos</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Buzzcreators. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
