import React, { useRef, useState } from 'react';
import { useStateMachine } from '@/contexts/StateMachineContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, Download, Plus, FileText, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export default function Toolbar() {
  const { stateMachine, loadFromXML, exportToXML, createState } = useStateMachine();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNewStateDialog, setShowNewStateDialog] = useState(false);
  const [newStateId, setNewStateId] = useState('');
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlString = e.target?.result as string;
        loadFromXML(xmlString);
        toast.success('XML loaded successfully');
      } catch (error) {
        console.error('Error loading XML:', error);
        toast.error('Failed to load XML file');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleExport = () => {
    try {
      const xmlString = exportToXML();
      const blob = new Blob([xmlString], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'statemachine.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('XML exported successfully');
    } catch (error) {
      console.error('Error exporting XML:', error);
      toast.error('Failed to export XML');
    }
  };
  
  const handleCreateState = () => {
    if (newStateId.trim()) {
      // Check if state already exists
      if (stateMachine?.states.some((s) => s.id === newStateId.trim())) {
        toast.error('A state with this ID already exists');
        return;
      }
      
      createState(newStateId.trim());
      setNewStateId('');
      setShowNewStateDialog(false);
      toast.success(`State "${newStateId.trim()}" created`);
    }
  };
  
  return (
    <div className="border-b bg-card px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-semibold">State Machine Editor</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Load XML
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={!stateMachine}
        >
          <Download className="w-4 h-4 mr-2" />
          Export XML
        </Button>
        
        <Dialog open={showNewStateDialog} onOpenChange={setShowNewStateDialog}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New State
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New State</DialogTitle>
              <DialogDescription>
                Enter a unique ID for the new state
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="state-id">State ID</Label>
                <Input
                  id="state-id"
                  value={newStateId}
                  onChange={(e) => setNewStateId(e.target.value)}
                  placeholder="e.g., NewState"
                  className="font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateState();
                  }}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewStateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateState}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

