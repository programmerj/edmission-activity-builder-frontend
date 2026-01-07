import { useState, useEffect } from 'react';
import { ActivityBuilder } from './components/ActivityBuilder';
import { Button } from './components/ui/button';
import { ChevronRight, Moon, Sun } from 'lucide-react';
import { cn } from './lib/utils';

function App() {
  const [activeStep, setActiveStep] = useState('2-1');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const steps = [
    { id: '2-1', title: 'Activity Builder' },
    { id: '2-2', title: '' },
    { id: '2-3', title: '' },
    { id: '2-4', title: '' },
    { id: '2-5', title: '' },
    { id: '3-1', title: '' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edmission
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {steps.map((step) => {
            return (
              <Button
                key={step.id}
                variant={activeStep === step.id ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start",
                  activeStep === step.id ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" : ""
                )}
                onClick={() => setActiveStep(step.id)}
              >
                <span>{step.id} {step.title}</span>
                {activeStep === step.id && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
              </Button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              S
            </div>
            <div>
              <p className="text-sm font-medium">Student User</p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between px-6 md:hidden">
          <h1 className="text-xl font-bold">Edmission</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        <div className="container mx-auto py-8 px-4">
          {activeStep === '2-1' && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Activity Builder</h2>
              </div>
              <ActivityBuilder />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
