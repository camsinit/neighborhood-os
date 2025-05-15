
import { useState, useEffect } from 'react';
import { setLogLevel, createLogger } from '@/utils/logger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug } from 'lucide-react';

// Define log levels as an enum
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

/**
 * Props for the LoggingControls component
 * @property embedded - Whether the component is embedded in another component
 */
interface LoggingControlsProps {
  // When true, the component is embedded in the sidebar and won't use fixed positioning
  embedded?: boolean;
}

/**
 * Enhanced debug component that allows controlling log levels at runtime
 * 
 * This enhanced version can be used both as a floating component or embedded in the sidebar.
 */
const LoggingControls = ({
  embedded = false
}: LoggingControlsProps) => {
  // State to track the current log level
  const [currentLevel, setCurrentLevel] = useState<string>(String(LogLevel.INFO));
  const [isVisible, setIsVisible] = useState(true); // Always visible for debugging
  const logger = createLogger('LoggingControls');

  // Initialize from localStorage if available
  useEffect(() => {
    try {
      // Load saved configuration from browser storage
      const savedConfig = localStorage.getItem('logger-config');
      if (savedConfig) {
        const {
          level
        } = JSON.parse(savedConfig);
        setCurrentLevel(String(level));
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  // Handler for when log level changes
  const handleLevelChange = (value: string) => {
    setCurrentLevel(value);
    setLogLevel(Number(value) as unknown as LogLevel);
  };

  // Set log level to TRACE for intensive debugging
  const setTraceMode = () => {
    const traceLevel = LogLevel.TRACE;
    setLogLevel(traceLevel as unknown as LogLevel);
    setCurrentLevel(String(LogLevel.TRACE));
    console.log("🔍 TRACE logging enabled - You will now see detailed app behavior");
  };

  // Clear the console for clean debugging
  const clearConsole = () => {
    console.clear();
    console.log("🧹 Console cleared - Fresh debugging session started");
  };

  // If embedded in the DiagnosticsPanel, use a simpler, inline layout
  if (embedded) {
    return <div className="space-y-2">
        {/* Log level selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Log Level:</span>
          <Select value={currentLevel} onValueChange={handleLevelChange}>
            <SelectTrigger className="h-7 text-xs w-24">
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
        
        {/* Control buttons */}
        <div className="flex gap-1">
          <Button variant="destructive" size="sm" onClick={setTraceMode} className="text-[10px] h-6 px-1 py-0">
            TRACE Logs
          </Button>
          <Button variant="outline" size="sm" onClick={clearConsole} className="text-[10px] h-6 px-1 py-0">
            Clear Console
          </Button>
        </div>
        
        {currentLevel === String(LogLevel.TRACE) && <Alert className="bg-amber-50 text-amber-800 border-amber-200 p-2 text-xs">
            <AlertDescription className="text-[10px]">
              TRACE logging active — Check console (F12)
            </AlertDescription>
          </Alert>}
      </div>;
  }

  // Render the original floating version when not embedded
  return null;
};
export default LoggingControls;
