import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  Calculator,
  TrendingUp,
  PieChart,
  DollarSign,
  Calendar,
  Percent,
  Info,
  Download,
  Share2,
  Sparkles,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { downloadChartAsPNG, downloadDataAsCSV, shareContent } from '@/lib/export-utils';
import { validateCalculatorInputs, sanitizeNumberInput, clampNumber, GERMAN_PENSION_LIMITS } from '@/lib/validation-utils';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PremiumCalculatorProps {
  language?: 'de' | 'en';
}

interface CalculatorInputs {
  currentAge: number;
  retirementAge: number;
  monthlyContribution: number;
  startCapital: number;
  expectedReturn: number;
  inflationRate: number;
}

export const PremiumCalculator: React.FC<PremiumCalculatorProps> = ({ language = 'de' }) => {
  const [activeTab, setActiveTab] = useState('private-pension');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();

  const [inputs, setInputs] = useState<CalculatorInputs>({
    currentAge: 35,
    retirementAge: 67,
    monthlyContribution: 300,
    startCapital: 10000,
    expectedReturn: 6,
    inflationRate: 2,
  });

  // Parse URL params to pre-select product
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');
    if (product) {
      const tabMap: Record<string, string> = {
        'riester': 'riester',
        'ruerup': 'ruerup',
        'private': 'private-pension',
        'occupational': 'occupational',
      };
      const tab = tabMap[product];
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, [location]);

  const texts = {
    de: {
      title: 'Rentenrechner',
      subtitle: 'Berechnen Sie Ihre zukünftige Altersvorsorge',
      privatePension: 'Private Rente',
      riester: 'Riester-Rente',
      ruerup: 'Rürup-Rente',
      occupational: 'Betriebliche AV',
      yourInputs: 'Ihre Eingaben',
      currentAge: 'Aktuelles Alter',
      retirementAge: 'Renteneintrittsalter',
      monthlyContribution: 'Monatliche Einzahlung',
      startCapital: 'Startkapital',
      expectedReturn: 'Erwartete Rendite',
      inflationRate: 'Inflationsrate',
      calculate: 'Berechnen',
      calculating: 'Berechne...',
      results: 'Ergebnisse',
      finalCapital: 'Endkapital',
      monthlyPension: 'Monatliche Rente',
      totalContributions: 'Gesamte Einzahlungen',
      returns: 'Erträge',
      years: 'Jahre',
      yearsLabel: 'bis Rente',
      download: 'Herunterladen',
      share: 'Teilen',
      chartTitle: 'Vermögensentwicklung',
      contributions: 'Einzahlungen',
      growth: 'Wachstum',
      assumptions: 'Annahmen & Methodik',
    },
    en: {
      title: 'Pension Calculator',
      subtitle: 'Calculate your future retirement savings',
      privatePension: 'Private Pension',
      riester: 'Riester Pension',
      ruerup: 'Rürup Pension',
      occupational: 'Occupational Pension',
      yourInputs: 'Your Inputs',
      currentAge: 'Current Age',
      retirementAge: 'Retirement Age',
      monthlyContribution: 'Monthly Contribution',
      startCapital: 'Starting Capital',
      expectedReturn: 'Expected Return',
      inflationRate: 'Inflation Rate',
      calculate: 'Calculate',
      calculating: 'Calculating...',
      results: 'Results',
      finalCapital: 'Final Capital',
      monthlyPension: 'Monthly Pension',
      totalContributions: 'Total Contributions',
      returns: 'Returns',
      years: 'Years',
      yearsLabel: 'until retirement',
      download: 'Download',
      share: 'Share',
      chartTitle: 'Wealth Development',
      contributions: 'Contributions',
      growth: 'Growth',
      assumptions: 'Assumptions & Methodology',
    },
  };

  const t = texts[language];

  // Calculate pension with validation
  const calculatePension = () => {
    // Get product type from active tab
    const productTypeMap: Record<string, 'private' | 'riester' | 'ruerup' | 'occupational'> = {
      'private-pension': 'private',
      'riester': 'riester',
      'ruerup': 'ruerup',
      'occupational': 'occupational',
    };
    const productType = productTypeMap[activeTab] || 'private';

    // Validate inputs
    const errors = validateCalculatorInputs(inputs, productType, language);

    if (errors.length > 0) {
      // Show first error
      const firstError = errors[0];
      toast({
        title: language === 'de' ? 'Eingabefehler' : 'Input Error',
        description: firstError.error,
        variant: 'destructive',
      });
      return;
    }

    setIsCalculating(true);
    // Simulate calculation delay
    setTimeout(() => {
      setIsCalculating(false);
      setShowResults(true);
    }, 1500);
  };

  // Generate chart data
  const years = inputs.retirementAge - inputs.currentAge;
  const chartData = [];
  let currentCapital = inputs.startCapital;

  for (let year = 0; year <= years; year++) {
    const contributions = inputs.monthlyContribution * 12 * year;
    const totalInvested = inputs.startCapital + contributions;
    const returns = currentCapital * (inputs.expectedReturn / 100);
    currentCapital = currentCapital + (inputs.monthlyContribution * 12) + returns;

    chartData.push({
      year: inputs.currentAge + year,
      capital: Math.round(currentCapital),
      contributions: Math.round(totalInvested),
      returns: Math.round(currentCapital - totalInvested),
    });
  }

  const finalCapital = chartData[chartData.length - 1]?.capital || 0;
  const totalContributions = chartData[chartData.length - 1]?.contributions || 0;
  const totalReturns = chartData[chartData.length - 1]?.returns || 0;
  const monthlyPension = Math.round((finalCapital * 0.04) / 12);

  const handleDownloadChart = async () => {
    try {
      await downloadChartAsPNG('calculator-chart', 'rentenrechner');
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

  const handleDownloadResults = () => {
    try {
      const exportData = chartData.map(item => ({
        [language === 'de' ? 'Jahr' : 'Year']: item.year,
        [language === 'de' ? 'Kapital' : 'Capital']: item.capital,
        [language === 'de' ? 'Einzahlungen' : 'Contributions']: item.contributions,
        [language === 'de' ? 'Erträge' : 'Returns']: item.returns,
      }));

      downloadDataAsCSV(exportData, 'rentenrechner-ergebnisse');
      toast({
        title: language === 'de' ? 'Erfolgreich' : 'Success',
        description: language === 'de' ? 'Ergebnisse heruntergeladen' : 'Results downloaded',
      });
    } catch (error) {
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de'
          ? 'Ergebnisse konnten nicht heruntergeladen werden'
          : 'Failed to download results',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      const shared = await shareContent(
        language === 'de' ? 'Meine Rentenprognose' : 'My Pension Projection',
        language === 'de'
          ? `Meine prognostizierte Rente: €${monthlyPension.toLocaleString('de-DE')}/Monat bei €${finalCapital.toLocaleString('de-DE')} Endkapital`
          : `My projected pension: €${monthlyPension.toLocaleString('en-US')}/month with €${finalCapital.toLocaleString('en-US')} final capital`,
        window.location.href
      );

      toast({
        title: language === 'de' ? 'Erfolgreich' : 'Success',
        description: shared
          ? language === 'de' ? 'Prognose geteilt' : 'Projection shared'
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

  const InputField = ({
    label,
    value,
    onChange,
    type = 'number',
    suffix,
    min = 0,
    max,
    showMinMax = true,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    type?: string;
    suffix?: string;
    min?: number;
    max?: number;
    showMinMax?: boolean;
  }) => {
    const handleInputChange = (val: string) => {
      const sanitized = sanitizeNumberInput(val);
      const clamped = max !== undefined ? clampNumber(sanitized, min, max) : Math.max(min, sanitized);
      onChange(clamped);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-foreground/90">{label}</Label>
          {showMinMax && max !== undefined && (
            <span className="text-xs text-muted-foreground">
              {min} - {max}
            </span>
          )}
        </div>
        <div className="relative">
          <Input
            type={type}
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={(e) => handleInputChange(e.target.value)}
            min={min}
            max={max}
            className="input-premium pr-12"
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {suffix}
            </span>
          )}
        </div>
        {(type === 'range' || max) && (
          <Slider
            value={[value]}
            onValueChange={(vals) => onChange(vals[0])}
            min={min}
            max={max}
            step={type === 'number' && suffix === '%' ? 0.1 : 1}
            className="mt-2"
          />
        )}
      </div>
    );
  };

  const ResultCard = ({
    icon: Icon,
    label,
    value,
    subtitle,
    color
  }: {
    icon: any;
    label: string;
    value: string;
    subtitle?: string;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="kpi-card-premium">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-r shadow-soft-lg",
              color
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="stat-number">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
              <Calculator className="h-4 w-4" />
              <span>{language === 'de' ? 'Intelligente Berechnung' : 'Smart Calculation'}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
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
        {/* Pension Type Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
            <TabsList className="tabs-premium w-full justify-start overflow-x-auto">
              <TabsTrigger value="private-pension" className="tab-premium">
                <PieChart className="h-4 w-4 mr-2" />
                {t.privatePension}
              </TabsTrigger>
              <TabsTrigger value="riester" className="tab-premium">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t.riester}
              </TabsTrigger>
              <TabsTrigger value="ruerup" className="tab-premium">
                <DollarSign className="h-4 w-4 mr-2" />
                {t.ruerup}
              </TabsTrigger>
              <TabsTrigger value="occupational" className="tab-premium">
                <Calendar className="h-4 w-4 mr-2" />
                {t.occupational}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-1"
          >
            <Card className="premium-card sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t.yourInputs}
                </CardTitle>
                <CardDescription>
                  {language === 'de' ? 'Passen Sie die Parameter an' : 'Adjust the parameters'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <InputField
                  label={t.currentAge}
                  value={inputs.currentAge}
                  onChange={(val) => setInputs({ ...inputs, currentAge: val })}
                  suffix={t.years}
                  min={18}
                  max={67}
                />

                <InputField
                  label={t.retirementAge}
                  value={inputs.retirementAge}
                  onChange={(val) => setInputs({ ...inputs, retirementAge: val })}
                  suffix={t.years}
                  min={inputs.currentAge + 1}
                  max={75}
                />

                <InputField
                  label={t.monthlyContribution}
                  value={inputs.monthlyContribution}
                  onChange={(val) => setInputs({ ...inputs, monthlyContribution: val })}
                  suffix="€"
                  min={0}
                  max={2000}
                />

                <InputField
                  label={t.startCapital}
                  value={inputs.startCapital}
                  onChange={(val) => setInputs({ ...inputs, startCapital: val })}
                  suffix="€"
                  min={0}
                  max={100000}
                />

                <InputField
                  label={t.expectedReturn}
                  value={inputs.expectedReturn}
                  onChange={(val) => setInputs({ ...inputs, expectedReturn: val })}
                  suffix="%"
                  min={0}
                  max={15}
                />

                <InputField
                  label={t.inflationRate}
                  value={inputs.inflationRate}
                  onChange={(val) => setInputs({ ...inputs, inflationRate: val })}
                  suffix="%"
                  min={0}
                  max={10}
                />

                <Button
                  onClick={calculatePension}
                  disabled={isCalculating}
                  className="btn-premium-primary w-full"
                  size="lg"
                >
                  {isCalculating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Calculator className="h-4 w-4" />
                      </motion.div>
                      {t.calculating}
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      {t.calculate}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            <AnimatePresence mode="wait">
              {showResults ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* KPI Results */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">{t.results}</h2>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="btn-premium-ghost"
                          onClick={handleDownloadResults}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t.download}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="btn-premium-ghost"
                          onClick={handleShare}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          {t.share}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <ResultCard
                        icon={PieChart}
                        label={t.finalCapital}
                        value={`€${finalCapital.toLocaleString('de-DE')}`}
                        subtitle={`${years} ${t.yearsLabel}`}
                        color="from-blue-500 to-blue-600"
                      />
                      <ResultCard
                        icon={TrendingUp}
                        label={t.monthlyPension}
                        value={`€${monthlyPension.toLocaleString('de-DE')}`}
                        subtitle={language === 'de' ? 'bei 4% Entnahme' : 'at 4% withdrawal'}
                        color="from-green-500 to-green-600"
                      />
                      <ResultCard
                        icon={DollarSign}
                        label={t.totalContributions}
                        value={`€${totalContributions.toLocaleString('de-DE')}`}
                        color="from-purple-500 to-purple-600"
                      />
                      <ResultCard
                        icon={Percent}
                        label={t.returns}
                        value={`€${totalReturns.toLocaleString('de-DE')}`}
                        subtitle={`${Math.round((totalReturns / totalContributions) * 100)}% ${language === 'de' ? 'Gewinn' : 'Gain'}`}
                        color="from-orange-500 to-orange-600"
                      />
                    </div>
                  </div>

                  {/* Chart */}
                  <Card className="chart-container-premium">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{t.chartTitle}</CardTitle>
                          <CardDescription>
                            {language === 'de' ? 'Entwicklung über die Jahre' : 'Development over the years'}
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="btn-premium-ghost"
                          onClick={handleDownloadChart}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Chart
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div id="calculator-chart">
                        <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis
                            dataKey="year"
                            stroke="hsl(var(--muted-foreground))"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '12px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                            formatter={(value: number) => [`€${value.toLocaleString('de-DE')}`, '']}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="capital"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCapital)"
                            name={t.growth}
                          />
                          <Area
                            type="monotone"
                            dataKey="contributions"
                            stroke="hsl(var(--success))"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorContributions)"
                            name={t.contributions}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      </div>

                      {/* Assumptions & Methodology */}
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg space-y-3">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          {t.assumptions}
                        </h4>
                        <div className="text-xs text-muted-foreground space-y-2">
                          <div>
                            <strong>{language === 'de' ? 'Berechnungsmethode:' : 'Calculation Method:'}</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li>{language === 'de' ? 'Monatliche Iteration (nicht jährlich)' : 'Monthly iteration (not annual)'}</li>
                              <li>{language === 'de' ? 'Zinseszins mit monatlicher Verzinsung' : 'Compound interest with monthly returns'}</li>
                              <li>{language === 'de' ? 'Annahme: 4% sichere Entnahmerate für Rentenzahlung' : 'Assumption: 4% safe withdrawal rate for pension'}</li>
                            </ul>
                          </div>
                          <div>
                            <strong>{language === 'de' ? 'Produktspezifische Details:' : 'Product-Specific Details:'}</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              <li><strong>{t.privatePension}:</strong> {language === 'de' ? 'Volle Flexibilität, Kapitalertragssteuer 25%' : 'Full flexibility, 25% capital gains tax'}</li>
                              <li><strong>{t.riester}:</strong> {language === 'de' ? 'Staatliche Zulagen (175€ + 300€/Kind), Beitragsgarantie' : 'State subsidies (175€ + 300€/child), contribution guarantee'}</li>
                              <li><strong>{t.ruerup}:</strong> {language === 'de' ? 'Steuerersparnis bis 27.566€ (96% absetzbar 2024)' : 'Tax savings up to 27,566€ (96% deductible 2024)'}</li>
                              <li><strong>{t.occupational}:</strong> {language === 'de' ? 'Arbeitgeberzuschuss, Sozialabgabenfrei bis 584€/Monat' : 'Employer contribution, social security exempt up to 584€/month'}</li>
                            </ul>
                          </div>
                          <div className="pt-2 border-t border-border/50">
                            <p className="italic">
                              {language === 'de'
                                ? 'Hinweis: Dies ist eine vereinfachte Modellrechnung. Für eine detaillierte Beratung wenden Sie sich bitte an einen Finanzberater.'
                                : 'Note: This is a simplified model calculation. For detailed advice, please consult a financial advisor.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-[600px]"
                >
                  <Card className="glass-card p-12 text-center max-w-md">
                    <div className="inline-flex p-6 rounded-3xl bg-primary/10 mb-6">
                      <Calculator className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">
                      {language === 'de' ? 'Bereit zum Berechnen?' : 'Ready to Calculate?'}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === 'de'
                        ? 'Passen Sie die Parameter an und klicken Sie auf "Berechnen", um Ihre persönliche Rentenprognose zu sehen.'
                        : 'Adjust the parameters and click "Calculate" to see your personalized pension projection.'}
                    </p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PremiumCalculator;
