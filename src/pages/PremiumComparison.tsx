import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Check,
  X,
  Plus,
  Trash2,
  Download,
  Share2,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Shield,
  Clock,
  Undo2,
} from 'lucide-react';
import { downloadChartAsPNG, downloadDataAsCSV, shareContent } from '@/lib/export-utils';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

interface PremiumComparisonProps {
  language?: 'de' | 'en';
}

interface Product {
  id: string;
  name: string;
  type: string;
  monthlyContribution: number;
  expectedReturn: number;
  taxBenefit: number;
  flexibility: number;
  guarantee: number;
  costs: number;
  features: string[];
  pros: string[];
  cons: string[];
}

export const PremiumComparison: React.FC<PremiumComparisonProps> = ({ language = 'de' }) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['riester', 'ruerup', 'private']);
  const [removedProduct, setRemovedProduct] = useState<{ id: string; index: number } | null>(null);
  const { toast } = useToast();

  const texts = {
    de: {
      title: 'Produktvergleich',
      subtitle: 'Vergleichen Sie Altersvorsorgeprodukte und finden Sie die beste Lösung',
      addProduct: 'Produkt hinzufügen',
      removeProduct: 'Entfernen',
      selectProduct: 'Produkt auswählen',
      riester: 'Riester-Rente',
      ruerup: 'Rürup-Rente',
      private: 'Private Rente',
      occupational: 'Betriebsrente',
      features: 'Eigenschaften',
      pros: 'Vorteile',
      cons: 'Nachteile',
      monthlyContribution: 'Monatlicher Beitrag',
      expectedReturn: 'Erwartete Rendite',
      taxBenefit: 'Steuervorteil',
      flexibility: 'Flexibilität',
      guarantee: 'Garantie',
      costs: 'Kosten',
      comparison: 'Vergleich',
      scoreCard: 'Bewertung',
      download: 'Herunterladen',
      share: 'Teilen',
      recommendation: 'Empfehlung',
    },
    en: {
      title: 'Product Comparison',
      subtitle: 'Compare pension products and find the best solution',
      addProduct: 'Add Product',
      removeProduct: 'Remove',
      selectProduct: 'Select Product',
      riester: 'Riester Pension',
      ruerup: 'Rürup Pension',
      private: 'Private Pension',
      occupational: 'Occupational Pension',
      features: 'Features',
      pros: 'Advantages',
      cons: 'Disadvantages',
      monthlyContribution: 'Monthly Contribution',
      expectedReturn: 'Expected Return',
      taxBenefit: 'Tax Benefit',
      flexibility: 'Flexibility',
      guarantee: 'Guarantee',
      costs: 'Costs',
      comparison: 'Comparison',
      scoreCard: 'Score Card',
      download: 'Download',
      share: 'Share',
      recommendation: 'Recommendation',
    },
  };

  const t = texts[language];

  const products: Record<string, Product> = {
    riester: {
      id: 'riester',
      name: t.riester,
      type: language === 'de' ? 'Staatlich gefördert' : 'Government-subsidized',
      monthlyContribution: 175,
      expectedReturn: 4.5,
      taxBenefit: 9,
      flexibility: 5,
      guarantee: 8,
      costs: 6,
      features: [
        language === 'de' ? 'Staatliche Zulagen' : 'State subsidies',
        language === 'de' ? 'Steuervorteile' : 'Tax benefits',
        language === 'de' ? 'Garantierte Beiträge' : 'Guaranteed contributions',
      ],
      pros: [
        language === 'de' ? 'Hohe staatliche Förderung' : 'High government support',
        language === 'de' ? 'Beitragsgarantie' : 'Contribution guarantee',
        language === 'de' ? 'Pfändungsschutz' : 'Protection from seizure',
      ],
      cons: [
        language === 'de' ? 'Begrenzte Flexibilität' : 'Limited flexibility',
        language === 'de' ? 'Niedrige Rendite' : 'Low returns',
        language === 'de' ? 'Komplexe Förderlogik' : 'Complex subsidy logic',
      ],
    },
    ruerup: {
      id: 'ruerup',
      name: t.ruerup,
      type: language === 'de' ? 'Steuerbegünstigt' : 'Tax-advantaged',
      monthlyContribution: 300,
      expectedReturn: 5.2,
      taxBenefit: 10,
      flexibility: 3,
      guarantee: 7,
      costs: 7,
      features: [
        language === 'de' ? 'Hohe Steuerersparnis' : 'High tax savings',
        language === 'de' ? 'Für Selbstständige' : 'For self-employed',
        language === 'de' ? 'Insolvenzschutz' : 'Bankruptcy protection',
      ],
      pros: [
        language === 'de' ? 'Maximale Steuerersparnis' : 'Maximum tax savings',
        language === 'de' ? 'Ideal für Selbstständige' : 'Ideal for self-employed',
        language === 'de' ? 'Hoher Insolvenzschutz' : 'High bankruptcy protection',
      ],
      cons: [
        language === 'de' ? 'Keine Kapitalauszahlung' : 'No capital payout',
        language === 'de' ? 'Nicht vererbbar' : 'Not inheritable',
        language === 'de' ? 'Keine vorzeitige Kündigung' : 'No early termination',
      ],
    },
    private: {
      id: 'private',
      name: t.private,
      type: language === 'de' ? 'Flexibel' : 'Flexible',
      monthlyContribution: 250,
      expectedReturn: 7.5,
      taxBenefit: 3,
      flexibility: 10,
      guarantee: 4,
      costs: 5,
      features: [
        language === 'de' ? 'Maximale Flexibilität' : 'Maximum flexibility',
        language === 'de' ? 'Weltweite Investments' : 'Global investments',
        language === 'de' ? 'Vererbbar' : 'Inheritable',
      ],
      pros: [
        language === 'de' ? 'Höchste Renditechance' : 'Highest return potential',
        language === 'de' ? 'Volle Kontrolle' : 'Full control',
        language === 'de' ? 'Jederzeit kündbar' : 'Cancellable anytime',
      ],
      cons: [
        language === 'de' ? 'Keine staatliche Förderung' : 'No government support',
        language === 'de' ? 'Höheres Risiko' : 'Higher risk',
        language === 'de' ? 'Kapitalertragssteuer' : 'Capital gains tax',
      ],
    },
    occupational: {
      id: 'occupational',
      name: t.occupational,
      type: language === 'de' ? 'Arbeitgeber-gefördert' : 'Employer-sponsored',
      monthlyContribution: 200,
      expectedReturn: 5.8,
      taxBenefit: 8,
      flexibility: 6,
      guarantee: 9,
      costs: 4,
      features: [
        language === 'de' ? 'Arbeitgeberzuschuss' : 'Employer contribution',
        language === 'de' ? 'Sozialabgabenfrei' : 'Social security exempt',
        language === 'de' ? 'Insolvenzgeschützt' : 'Insolvency protected',
      ],
      pros: [
        language === 'de' ? 'Arbeitgeber-Beteiligung' : 'Employer participation',
        language === 'de' ? 'Steuer- und Sozialabgabenfrei' : 'Tax and social security exempt',
        language === 'de' ? 'Hohe Sicherheit' : 'High security',
      ],
      cons: [
        language === 'de' ? 'An Arbeitgeber gebunden' : 'Tied to employer',
        language === 'de' ? 'Eingeschränkte Portabilität' : 'Limited portability',
        language === 'de' ? 'Begrenzte Wahlmöglichkeiten' : 'Limited choices',
      ],
    },
  };

  const selectedProductData = selectedProducts.map((id) => products[id]);

  // Radar chart data
  const radarData = [
    {
      metric: t.expectedReturn,
      ...Object.fromEntries(selectedProducts.map((id) => [id, products[id].expectedReturn])),
    } as Record<string, string | number>,
    {
      metric: t.taxBenefit,
      ...Object.fromEntries(selectedProducts.map((id) => [id, products[id].taxBenefit])),
    } as Record<string, string | number>,
    {
      metric: t.flexibility,
      ...Object.fromEntries(selectedProducts.map((id) => [id, products[id].flexibility])),
    } as Record<string, string | number>,
    {
      metric: t.guarantee,
      ...Object.fromEntries(selectedProducts.map((id) => [id, products[id].guarantee])),
    } as Record<string, string | number>,
    {
      metric: t.costs,
      ...Object.fromEntries(selectedProducts.map((id) => [id, 10 - products[id].costs])), // Inverted for better visualization
    } as Record<string, string | number>,
  ];

  const comparisonData = selectedProducts.map((id) => ({
    name: products[id].name,
    contribution: products[id].monthlyContribution,
    return: products[id].expectedReturn,
  }));

  const addProduct = (productId: string) => {
    if (!selectedProducts.includes(productId) && selectedProducts.length < 4) {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const removeProduct = (productId: string) => {
    if (selectedProducts.length > 1) {
      const index = selectedProducts.indexOf(productId);
      setRemovedProduct({ id: productId, index });
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));

      // Show undo toast
      toast({
        title: language === 'de' ? 'Produkt entfernt' : 'Product removed',
        description: language === 'de'
          ? `${products[productId].name} wurde entfernt. Rückgängig machen?`
          : `${products[productId].name} was removed. Undo?`,
        action: (
          <button
            onClick={undoRemoveProduct}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-primary hover:text-primary/80"
          >
            <Undo2 className="h-3 w-3" />
            {language === 'de' ? 'Rückgängig' : 'Undo'}
          </button>
        ),
      });
    }
  };

  const undoRemoveProduct = () => {
    if (removedProduct) {
      const newProducts = [...selectedProducts];
      newProducts.splice(removedProduct.index, 0, removedProduct.id);
      setSelectedProducts(newProducts);
      setRemovedProduct(null);
      toast({
        title: language === 'de' ? 'Wiederhergestellt' : 'Restored',
        description: language === 'de'
          ? 'Produkt wurde wiederhergestellt'
          : 'Product was restored',
      });
    }
  };

  const handleDownloadChart = async () => {
    try {
      await downloadChartAsPNG('comparison-radar-chart', 'produktvergleich');
      toast({
        title: language === 'de' ? 'Erfolgreich' : 'Success',
        description: language === 'de' ? 'Chart heruntergeladen' : 'Chart downloaded',
      });
    } catch (error) {
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de'
          ? 'Chart konnte nicht heruntergeladen werden'
          : 'Failed to download chart',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadData = () => {
    try {
      const exportData = radarData.map(item => ({
        [language === 'de' ? 'Kriterium' : 'Criterion']: item.metric,
        ...Object.fromEntries(
          selectedProducts.map(id => [products[id].name, item[id] || 0])
        ),
      }));

      downloadDataAsCSV(exportData, 'produktvergleich-daten');
      toast({
        title: language === 'de' ? 'Erfolgreich' : 'Success',
        description: language === 'de' ? 'Daten heruntergeladen' : 'Data downloaded',
      });
    } catch (error) {
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de'
          ? 'Daten konnten nicht heruntergeladen werden'
          : 'Failed to download data',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      const productNames = selectedProducts.map(id => products[id].name).join(', ');
      const shared = await shareContent(
        language === 'de' ? 'Produktvergleich' : 'Product Comparison',
        language === 'de'
          ? `Mein Altersvorsorge-Vergleich: ${productNames}`
          : `My pension product comparison: ${productNames}`,
        window.location.href
      );

      toast({
        title: language === 'de' ? 'Erfolgreich' : 'Success',
        description: shared
          ? language === 'de' ? 'Vergleich geteilt' : 'Comparison shared'
          : language === 'de' ? 'Link kopiert' : 'Link copied',
      });
    } catch (error) {
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de'
          ? 'Teilen fehlgeschlagen'
          : 'Failed to share',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm">
              <BarChart3 className="h-4 w-4" />
              <span>{language === 'de' ? 'Intelligenter Vergleich' : 'Smart Comparison'}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-success/5 rounded-full blur-3xl -z-10" />
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Product Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="font-semibold">{language === 'de' ? 'Produkte auswählen:' : 'Select products:'}</h3>
                {Object.values(products).map((product) => (
                  <Button
                    key={product.id}
                    variant={selectedProducts.includes(product.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      selectedProducts.includes(product.id)
                        ? removeProduct(product.id)
                        : addProduct(product.id)
                    }
                    disabled={!selectedProducts.includes(product.id) && selectedProducts.length >= 4}
                    className={selectedProducts.includes(product.id) ? "btn-premium-primary" : "btn-premium-ghost"}
                  >
                    {selectedProducts.includes(product.id) ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {product.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Radar Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-12"
        >
          <Card className="chart-container-premium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t.scoreCard}</CardTitle>
                  <CardDescription>
                    {language === 'de' ? 'Bewertung nach Kriterien (0-10 Punkte)' : 'Rating by criteria (0-10 points)'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-premium-ghost"
                    onClick={handleDownloadChart}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t.download}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-premium-ghost"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    {t.share}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div id="comparison-radar-chart">
                <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" style={{ fontSize: '12px' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} style={{ fontSize: '10px' }} />
                  {selectedProducts.map((id, index) => (
                    <Radar
                      key={id}
                      name={products[id].name}
                      dataKey={id}
                      stroke={`hsl(var(--chart-${index + 1}))`}
                      fill={`hsl(var(--chart-${index + 1}))`}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
              </div>

              {/* Data Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 font-semibold">{language === 'de' ? 'Kriterium' : 'Criterion'}</th>
                      {selectedProducts.map(id => (
                        <th key={id} className="text-center p-2 font-semibold">{products[id].name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {radarData.map((row, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="p-2 text-muted-foreground">{row.metric}</td>
                        {selectedProducts.map(id => (
                          <td key={id} className="text-center p-2 font-medium">
                            {row[id] || 0}/10
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-premium-ghost"
                    onClick={handleDownloadData}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {language === 'de' ? 'Daten als CSV' : 'Data as CSV'}
                  </Button>
                </div>
              </div>

              {/* Data Source & Methodology */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {language === 'de' ? 'Datenquellen & Methodik' : 'Data Sources & Methodology'}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {language === 'de'
                    ? 'Die Bewertungen basieren auf gesetzlichen Rahmenbedingungen (EStG §10a, §82), durchschnittlichen Marktdaten und Expertenbewertungen. Renditen sind historische Durchschnittswerte (Quelle: BaFin, Stiftung Warentest 2024). Flexibilität, Garantie und Kosten werden auf einer Skala von 0-10 bewertet. Steuervorteile basieren auf einem durchschnittlichen Steuersatz von 35%.'
                    : 'Ratings are based on legal frameworks (EStG §10a, §82), average market data, and expert assessments. Returns are historical averages (Source: BaFin, Stiftung Warentest 2024). Flexibility, guarantees, and costs are rated on a 0-10 scale. Tax benefits are based on an average tax rate of 35%.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {selectedProductData.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <Card className="premium-card h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">{product.type}</Badge>
                    </div>
                    {selectedProducts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProduct(product.id)}
                        className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.monthlyContribution}</span>
                      <span className="font-semibold">€{product.monthlyContribution}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.expectedReturn}</span>
                      <span className="font-semibold text-success">{product.expectedReturn}%</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">{t.features}</h4>
                    <ul className="space-y-1">
                      {product.features.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pros */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-success">{t.pros}</h4>
                    <ul className="space-y-1">
                      {product.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-destructive">{t.cons}</h4>
                    <ul className="space-y-1">
                      {product.cons.map((con, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={`/calculator?product=${product.id}`}>
                    <Button className="w-full btn-premium-primary">
                      {language === 'de' ? 'Mehr erfahren' : 'Learn more'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumComparison;
