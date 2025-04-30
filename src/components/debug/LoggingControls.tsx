
import { useState, useEffect } from 'react';
import { LogLevel, setLogLevel, enableModules } from '@/utils/logger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Debug component that allows controlling log levels at runtime
 * 
 * This component is intended to be shown only during development
 * or debugging sessions.
 * 
 * Now designed as a minimalist interface to appear under the diagnostics panel.
 */
const LoggingControls = () => {
  // State to track the current log level
  const [currentLevel, setCurrentLevel] = useState<string>(String(LogLevel.INFO));
  const [isVisible, setIsVisible] = useState(false);

  // Initialize from localStorage if available
  useEffect(() => {
    try {
      // Load saved configuration from browser storage
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

  // Handler for when log level changes
  const handleLevelChange = (value: string) => {
    setCurrentLevel(value);
    setLogLevel(Number(value) as LogLevel);
  };
  
  // Don't render anything if not visible
  if (!isVisible) {
    return null;
  }

  // Render a minimalist version of the control
  return (
    <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
      <span>Log Level:</span>
      <Select value={currentLevel} onValueChange={handleLevelChange}>
        <SelectTrigger className="h-6 text-xs w-20 ml-2">
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
    </div>
  );
};

export default LoggingControls;
