
import { useState, useEffect } from 'react';
import { LogLevel, setLogLevel, setDebugMode, setLoggingEnabled } from '@/utils/logger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, Settings, Activity } from 'lucide-react';
import ActivityNotificationDebugger from './ActivityNotificationDebugger';

/**
 * Props for the LoggingControls component
 * @property embedded - Whether the component is embedded in another component
 */
interface LoggingControlsProps {
  // When true, the component is embedded in the sidebar and won't use fixed positioning
  embedded?: boolean;
}

/**
 * LoggingControls component for managing application logging levels
 * 
 * This component allows developers to control logging verbosity in real-time.
 * It's particularly useful for debugging and can be toggled on/off as needed.
 */
const LoggingControls = ({ embedded = false }: LoggingControlsProps) => {
  // State for current logging configuration
  const [currentLevel, setCurrentLevel] = useState<LogLevel>('warn');
  const [loggingEnabled, setLoggingEnabledState] = useState(true);
  const [debugMode, setDebugModeState] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Only show in development mode or when debug=true is in URL
  useEffect(() => {
    const shouldShow = isDevelopment || window.location.search.includes('debug=true');
    setIsVisible(shouldShow);
    
    // Initialize debug mode based on URL parameter
    const urlDebug = window.location.search.includes('debug=true');
    setDebugModeState(urlDebug);
    setDebugMode(urlDebug);
  }, [isDevelopment]);

  /**
   * Handle log level changes
   */
  const handleLevelChange = (level: LogLevel) => {
    setCurrentLevel(level);
    setLogLevel(level);
  };

  /**
   * Handle logging enabled/disabled toggle
   */
  const handleLoggingToggle = (enabled: boolean) => {
    setLoggingEnabledState(enabled);
    setLoggingEnabled(enabled);
  };

  /**
   * Handle debug mode toggle
   */
  const handleDebugToggle = (enabled: boolean) => {
    setDebugModeState(enabled);
    setDebugMode(enabled);
  };

  /**
   * Clear console
   */
  const clearConsole = () => {
    console.clear();
  };

  // Don't render if not in development mode and no debug parameter
  if (!isVisible) {
    return null;
  }

  const containerClasses = embedded 
    ? "w-full" 
    : "fixed bottom-4 right-4 z-50 w-80";

  return (
    <div className={containerClasses}>
      <Tabs defaultValue="logging" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logging" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Logging
          </TabsTrigger>
          <TabsTrigger value="activity-debug" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Debug
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="logging">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bug className="h-4 w-4" />
                Logging Controls
              </CardTitle>
              <CardDescription className="text-xs">
                Control application logging levels and verbosity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logging Level Selection */}
              <div className="space-y-2">
                <Label htmlFor="log-level" className="text-xs font-medium">
                  Log Level
                </Label>
                <Select value={currentLevel} onValueChange={handleLevelChange}>
                  <SelectTrigger id="log-level" className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug (All logs)</SelectItem>
                    <SelectItem value="info">Info & above</SelectItem>
                    <SelectItem value="warn">Warnings & errors</SelectItem>
                    <SelectItem value="error">Errors only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Logging Enabled Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="logging-enabled" className="text-xs font-medium">
                  Logging Enabled
                </Label>
                <Switch
                  id="logging-enabled"
                  checked={loggingEnabled}
                  onCheckedChange={handleLoggingToggle}
                />
              </div>

              {/* Debug Mode Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="debug-mode" className="text-xs font-medium">
                  Debug Mode
                </Label>
                <Switch
                  id="debug-mode"
                  checked={debugMode}
                  onCheckedChange={handleDebugToggle}
                />
              </div>

              {/* Clear Console Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearConsole}
                className="w-full h-8 text-xs"
              >
                Clear Console
              </Button>

              {/* Current Status */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Level: {currentLevel}</div>
                <div>Enabled: {loggingEnabled ? 'Yes' : 'No'}</div>
                <div>Debug: {debugMode ? 'Yes' : 'No'}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity-debug">
          <ActivityNotificationDebugger />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoggingControls;
