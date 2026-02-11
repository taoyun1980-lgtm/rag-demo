import React, { useState } from 'react';
import { Button } from './Button';

interface JsonViewerProps {
  data: any;
  title?: string;
}

export function JsonViewer({ data, title = 'JSON 数据' }: JsonViewerProps) {
  const [collapsed, setCollapsed] = useState(true);

  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <span className="text-sm font-medium">{title}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '展开' : '收起'}
        </Button>
      </div>
      {!collapsed && (
        <div className="p-4 bg-card">
          <pre className="text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto">
            <code>{jsonString}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
