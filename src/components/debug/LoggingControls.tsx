
import { useState, useEffect } from 'react';
import { LogLevel, setLogLevel, enableModules } from '@/utils/logger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug } from 'lucide-react'; // Changed from BugAntIcon to Bug from lucide-react

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
const LoggingControls = ({ embedded = false }: LoggingControlsProps) => {
  // State to track the current log level
  const [currentLevel, setCurrentLevel] = useState<string>(String(LogLevel.INFO));
  const [isVisible, setIsVisible] = useState(true); // Always visible for debugging

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
  }, []);

  // Handler for when log level changes
  const handleLevelChange = (value: string) => {
    setCurrentLevel(value);
    setLogLevel(Number(value) as LogLevel);
  };
  
  // Set log level to TRACE for intensive debugging
  const setTraceMode = () => {
    setLogLevel(LogLevel.TRACE);
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
    return (
      <div className="space-y-2">
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
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={setTraceMode}
            className="text-[10px] h-6 px-1 py-0"
          >
            TRACE Logs
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearConsole}
            className="text-[10px] h-6 px-1 py-0"
          >
            Clear Console
          </Button>
        </div>
        
        {currentLevel === String(LogLevel.TRACE) && (
          <Alert className="bg-amber-50 text-amber-800 border-amber-200 p-2 text-xs">
            <AlertDescription className="text-[10px]">
              TRACE logging active — Check console (F12)
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
  
  // Render the original floating version when not embedded
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 shadow-lg rounded-lg p-4 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          Debug Controls
        </h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Log Level:</span>
          <Select value={currentLevel} onValueChange={handleLevelChange}>
            <SelectTrigger className="h-8 text-xs w-24">
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
        
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={setTraceMode}
            className="text-xs"
          >
            Enable TRACE Logs
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearConsole}
            className="text-xs"
          >
            Clear Console
          </Button>
        </div>
        
        {currentLevel === String(LogLevel.TRACE) && (
          <Alert className="bg-amber-50 text-amber-800 border-amber-200">
            <AlertDescription className="text-xs">
              TRACE logging active — Check the console (F12) for detailed logs
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default LoggingControls;
