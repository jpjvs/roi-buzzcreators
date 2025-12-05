"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  DollarSign,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CampaignParams, CreatorResults } from "@/dtos/campaign";
import type { InstagramProfile } from "@/dtos/instagram";
import {
  calculateCreatorROI,
  calculateTotals,
} from "@/services/roi-calculator";
import { getUserEmail, recordSimulation } from "@/services/access-control";

interface Creator {
  username: string;
  id: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<CreatorResults[]>([]);
  const [totals, setTotals] = useState({
    total_cost: 0,
    total_revenue: 0,
    total_sales: 0,
    avg_roi: 0,
  });

  useEffect(() => {
    setMounted(true);

    const loadResults = async () => {
      try {
        // Get data from localStorage
        const campaignParamsStr = localStorage.getItem("campaignParams");
        const creatorsStr = localStorage.getItem("creators");

        if (!campaignParamsStr || !creatorsStr) {
          router.push("/calculator");
          return;
        }

        const campaignParams: CampaignParams = JSON.parse(campaignParamsStr);
        const creators: Creator[] = JSON.parse(creatorsStr);

        // Fetch Instagram profiles
        const response = await fetch("/api/fetch-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usernames: creators.map((c) => c.username) }),
        });

        const { profiles }: { profiles: InstagramProfile[] } =
          await response.json();

        // Calculate ROI for each creator
        const calculatedResults = profiles.map((profile) =>
          calculateCreatorROI(profile, campaignParams)
        );

        setResults(calculatedResults);

        // Calculate totals
        const calculatedTotals = calculateTotals(calculatedResults);
        calculatedTotals.avg_roi =
          calculatedTotals.total_cost > 0
            ? ((calculatedTotals.total_revenue - calculatedTotals.total_cost) /
                calculatedTotals.total_cost) *
              100
            : 0;

        setTotals(calculatedTotals);

        const email = getUserEmail();
        if (email) {
          recordSimulation(
            email,
            creators.map((c) => c.username)
          );
        }
      } catch (error) {
        console.error("[v0] Error loading results:", error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [router]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Calculando resultados...</p>
        </div>
      </div>
    );
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/calculator")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Nova Simulação
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Resultados da Simulação
          </h1>
          <p className="text-muted-foreground text-lg">
            Análise detalhada de cada influenciador
          </p>
        </div>

        {/* Important Disclaimer */}
        <Alert className="mb-8 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <AlertDescription className="text-amber-900 dark:text-amber-200">
            <strong>Importante:</strong> Os valores de Views, Vendas, Receita e
            ROI são estimativas calculadas com base em dados públicos e não
            representam métricas reais do Instagram. Apenas os dados de
            Seguidores são informações reais dos perfis.
          </AlertDescription>
        </Alert>

        {/* Results Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resultados por Criador</CardTitle>
            <CardDescription>
              Comparação detalhada de performance estimada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Perfil
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">
                      Seguidores
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">
                      Views Est.
                      <span className="ml-1 text-amber-600 dark:text-amber-500">
                        *
                      </span>
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">
                      Custo Est.
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">
                      Vendas Est.
                      <span className="ml-1 text-amber-600 dark:text-amber-500">
                        *
                      </span>
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">
                      Receita Est.
                      <span className="ml-1 text-amber-600 dark:text-amber-500">
                        *
                      </span>
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">
                      ROI
                      <span className="ml-1 text-amber-600 dark:text-amber-500">
                        *
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={index}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-4 px-4 font-medium">
                        @{result.username}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {result.followers.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-4 px-4 text-right text-muted-foreground">
                        {result.estimated_views.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-4 px-4 text-right">
                        R${" "}
                        {result.estimated_cost.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-4 px-4 text-right text-muted-foreground">
                        {result.estimated_sales}
                      </td>
                      <td className="py-4 px-4 text-right text-chart-1 font-semibold">
                        R${" "}
                        {result.estimated_revenue.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={
                            result.estimated_roi >= 0
                              ? "text-chart-1 font-bold"
                              : "text-destructive font-bold"
                          }
                        >
                          {result.estimated_roi.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground mt-4 flex items-start gap-1">
              <span className="text-amber-600 dark:text-amber-500">*</span>
              <span>
                Valores estimados - não são métricas reais fornecidas pelo
                Instagram
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-5 w-5" />
                <CardDescription>Investimento Total</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                R${" "}
                {totals.total_cost.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-5 w-5" />
                <CardDescription>Receita Total Estimada *</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-1">
                R${" "}
                {totals.total_revenue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-5 w-5" />
                <CardDescription>ROI Médio *</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  totals.avg_roi >= 0 ? "text-chart-1" : "text-destructive"
                }`}
              >
                {totals.avg_roi.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-muted/50 border-2">
          <CardContent className="pt-6">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-3">
                Gostou da simulação? Abandone a planilha.
              </h3>
              <p className="text-muted-foreground mb-6">
                A calculadora usa estimativas. O <strong>Buzzcreators</strong>{" "}
                gerencia suas parcerias, mede o ROI real de cada story publicado
                e automatiza seus pagamentos. Tudo em um só lugar.
              </p>
              <Button size="lg" asChild>
                <a
                  href="https://buzzcreators.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Conhecer o Buzzcreators
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
