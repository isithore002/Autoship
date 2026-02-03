import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings as SettingsType } from '@/types/run';
import { getSettings, saveSettings, defaultSettings } from '@/lib/store';
import { Save, RotateCcw, Server, Cpu, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleChange = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettings(settings);
    setHasChanges(false);
    toast.success('Settings saved');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
    setHasChanges(false);
    toast.info('Settings reset to defaults');
  };

  return (
    <Layout>
      <div className="p-8 max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure AutoShip behavior and preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Deployment Provider */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Deployment Provider</h3>
                <p className="text-sm text-muted-foreground">Choose where to deploy your apps</p>
              </div>
            </div>

            <Select 
              value={settings.deployProvider} 
              onValueChange={(v) => handleChange('deployProvider', v as SettingsType['deployProvider'])}
            >
              <SelectTrigger className="bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vercel">Vercel</SelectItem>
                <SelectItem value="firebase">Firebase Hosting</SelectItem>
                <SelectItem value="netlify">Netlify</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Retry Count */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-running/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-running" />
              </div>
              <div>
                <h3 className="font-semibold">VibeCoder Retry Limit</h3>
                <p className="text-sm text-muted-foreground">
                  Maximum fix attempts for failed builds
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Slider
                value={[settings.maxRetryCount]}
                onValueChange={([v]) => handleChange('maxRetryCount', v)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1 retry</span>
                <span className="font-medium text-foreground">{settings.maxRetryCount} retries</span>
                <span>10 retries</span>
              </div>
            </div>
          </div>

          {/* Model Choice */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">AI Model</h3>
                <p className="text-sm text-muted-foreground">Select the model for code generation</p>
              </div>
            </div>

            <Select 
              value={settings.modelChoice} 
              onValueChange={(v) => handleChange('modelChoice', v as SettingsType['modelChoice'])}
            >
              <SelectTrigger className="bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-3-pro">Gemini 3 Pro (High Quality)</SelectItem>
                <SelectItem value="gemini-3-flash">Gemini 3 Flash (Fast)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              variant="glow" 
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
