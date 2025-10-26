import React, { useEffect, useState } from 'react';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { OnboardingStorageService } from '../../services/onboardingStorage';
import OnboardingWizard from './OnboardingWizard';
import { Loader2, PartyPopper } from 'lucide-react';
import { useLocation } from 'wouter';

interface OnboardingContainerProps {
  children: React.ReactNode;
}

const OnboardingContainer: React.FC<OnboardingContainerProps> = ({ children }) => {
  const { isCompleted, loadFromStorage, completeOnboarding } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    let isMounted = true;
    let dataLoaded = false;

    const loadData = async () => {
      try {
        await loadFromStorage();

        if (isMounted && !dataLoaded) {
          dataLoaded = true;
          // Use centralized validation (single source of truth)
          const persistedData = OnboardingStorageService.loadData();
          const completed = OnboardingStorageService.isCompleted(persistedData);
          setShowOnboarding(!completed);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[OnboardingContainer] Failed to load onboarding data:', error);
        if (isMounted && !dataLoaded) {
          dataLoaded = true;
          setError('Fehler beim Laden der Daten');
          // On error, show onboarding to allow user to start fresh
          setShowOnboarding(true);
          setIsLoading(false);
        }
      }
    };

  // Safety timeout: Always show something after 1 second
  // This prevents infinite loading if loadFromStorage hangs
  const timeoutId = setTimeout(() => {
    if (isMounted && !dataLoaded) {
      dataLoaded = true;
      try {
        // Use centralized validation (single source of truth)
        const persistedData = OnboardingStorageService.loadData();
        const completed = OnboardingStorageService.isCompleted(persistedData);
        setShowOnboarding(!completed);
        setIsLoading(false);
      } catch (error) {
        console.error('[OnboardingContainer] Timeout fallback failed:', error);
        // Ultimate fallback: show main app
        setShowOnboarding(false);
        setIsLoading(false);
      }
    }
  }, 1000);

    loadData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [loadFromStorage]); // Only depend on loadFromStorage, not isCompleted

  // React to onboarding completion changes (when wizard completes during session)
  useEffect(() => {
    if (isCompleted && showOnboarding) {
      // User just completed onboarding
      setShowOnboarding(false);
      setShowWelcome(true);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        setLocation('/');
      }, 500);

      // Hide welcome message after 5 seconds
      setTimeout(() => {
        setShowWelcome(false);
      }, 5000);
    }
  }, [isCompleted, showOnboarding, setLocation]);

  // Skip onboarding function for debugging
  const handleSkipOnboarding = () => {
    try {
      completeOnboarding();
      setShowOnboarding(false);
    } catch (err) {
      console.error('Failed to skip onboarding:', err);
      // Force skip even if completion fails
      setShowOnboarding(false);
    }
  };

  // Show loading spinner while checking onboarding status (max 1 second)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Lade Anwendung...</p>
        </div>
      </div>
    );
  }

  // Show error state with option to continue
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">Fehler beim Laden: {error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setShowOnboarding(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Trotzdem fortfahren
          </button>
        </div>
      </div>
    );
  }

  // Show onboarding wizard if not completed
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={handleSkipOnboarding}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Überspringen
          </button>
        </div>
        <OnboardingWizard />
      </div>
    );
  }

  // Show main application
  return (
    <div className="min-h-screen">
      {children}

      {/* Welcome Message after Onboarding Completion */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PartyPopper className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Willkommen!
              </h2>
              <p className="text-gray-600 mb-6">
                Ihre Daten wurden erfolgreich gespeichert. Sie werden nun zu Ihrem Dashboard weitergeleitet, wo Sie alle Funktionen nutzen können.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowWelcome(false);
                    setLocation('/');
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Zum Dashboard
                </button>
                <button
                  onClick={() => {
                    setShowWelcome(false);
                    setLocation('/calculator');
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Zum Rechner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingContainer;