import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import StateMachineGraph from '@/components/StateMachineGraph';
import PropertiesPanel from '@/components/PropertiesPanel';
import TransitionsPanel from '@/components/TransitionsPanel';
import ValidationPanel from '@/components/ValidationPanel';
import Toolbar from '@/components/Toolbar';
import { Settings, GitBranch, AlertCircle, Network, List, ArrowDownToLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StateListView from '@/components/StateListView';
import IncomingTransitionsPanel from '@/components/IncomingTransitionsPanel';

export default function Editor() {
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <Toolbar />
      
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Main view area */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="w-full h-full flex flex-col">
              {/* View toggle */}
              <div className="flex-shrink-0 p-2 border-b flex gap-2 bg-background">
                <Button
                  size="sm"
                  variant={viewMode === 'graph' ? 'default' : 'outline'}
                  onClick={() => setViewMode('graph')}
                >
                  <Network className="w-4 h-4 mr-2" />
                  Graph View
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4 mr-2" />
                  List View
                </Button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {viewMode === 'graph' ? <StateMachineGraph /> : <StateListView />}
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Right sidebar with tabs */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <Tabs defaultValue="properties" className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="transitions" className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Transitions
              </TabsTrigger>
              <TabsTrigger value="incoming" className="flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4" />
                Incoming
              </TabsTrigger>
              <TabsTrigger value="validation" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Validation
              </TabsTrigger>
            </TabsList>
              
              <TabsContent value="properties" className="flex-1 mt-0 overflow-hidden">
                <PropertiesPanel />
              </TabsContent>
              
              <TabsContent value="transitions" className="flex-1 overflow-hidden">
              <TransitionsPanel />
            </TabsContent>
            
            <TabsContent value="incoming" className="flex-1 overflow-hidden">
              <IncomingTransitionsPanel />
            </TabsContent>
            
            <TabsContent value="validation" className="flex-1 overflow-hidden">
              <ValidationPanel />
            </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

