
import { useState, useEffect } from 'react';
import { LogLevel, setLogLevel, enableModules } from '@/utils/logger';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Debug component that allows controlling log levels at runtime
 * 
 * This component is intended to be shown only during development
 * or debugging sessions.
 */
const LoggingControls = () => {
  const [currentLevel, setCurrentLevel] = useState<string>(String(LogLevel.INFO));
  const [isVisible, setIsVisible] = useState(false);

  // Initialize from localStorage if available
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('logger-config');
      if (savedConfig) {
        const { level } = JSON.parse(savedConfig);
        setCurrentLevel(String(level));
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    // Only show controls in development or when explicitly enabled
    const shouldShow = process.env.NODE_ENV === 'development' || 
                      localStorage.getItem('show-debug-controls') === 'true';
    setIsVisible(shouldShow);
  }, []);

  const handleLevelChange = (value: string) => {
    setCurrentLevel(value);
    setLogLevel(Number(value) as LogLevel);
  };
  
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white/90 dark:bg-black/90 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <h3 className="text-sm font-medium mb-2">Logging Controls</h3>
      <div className="flex items-center gap-2">
        <span className="text-xs">Log Level:</span>
        <Select value={currentLevel} onValueChange={handleLevelChange}>
          <SelectTrigger className="h-7 text-xs w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={String(LogLevel.ERROR)}>ERROR</SelectItem>
            <SelectItem value={String(LogLevel.WARN)}>WARN</SelectItem>
            <SelectItem value={String(LogLevel.INFO)}>INFO</SelectItem>
            <SelectItem value={String(LogLevel.DEBUG)}>DEBUG</SelectItem>
            <SelectItem value={String(LogLevel.TRACE)}>TRACE</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs"
          onClick={() => setIsVisible(false)}
        >
          Hide
        </Button>
      </div>
    </div>
  );
};

export default LoggingControls;
