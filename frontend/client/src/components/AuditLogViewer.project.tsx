import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Edit, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'rejected';
  entity: string;
  oldValue?: string;
  newValue?: string;
  description: string;
}

interface AuditLogViewerProps {
  logs: AuditLog[];
  title?: string;
}

const actionConfig = {
  created: { icon: Plus, label: 'Created', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  updated: { icon: Edit, label: 'Updated', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  deleted: { icon: Trash2, label: 'Deleted', class: 'bg-red-100 text-red-700 border-red-200' },
  approved: { icon: CheckCircle, label: 'Approved', class: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { icon: XCircle, label: 'Rejected', class: 'bg-red-100 text-red-700 border-red-200' },
};

export default function AuditLogViewer({ logs, title = 'Audit History' }: AuditLogViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No audit logs available</p>
              </div>
            ) : (
              logs.map((log) => {
                const ActionIcon = actionConfig[log.action].icon;
                return (
                  <div key={log.id} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                        <ActionIcon className="h-5 w-5 text-slate-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={actionConfig[log.action].class}>
                          {actionConfig[log.action].label}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-900 mb-1">{log.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <User className="h-3 w-3" />
                        <span>{log.user}</span>
                      </div>
                      {(log.oldValue || log.newValue) && (
                        <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                          {log.oldValue && (
                            <div className="text-xs">
                              <span className="text-slate-500">Old: </span>
                              <span className="line-through text-red-600">{log.oldValue}</span>
                            </div>
                          )}
                          {log.newValue && (
                            <div className="text-xs">
                              <span className="text-slate-500">New: </span>
                              <span className="text-green-600">{log.newValue}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Example usage component
export function AuditLogExample() {
  const sampleLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2026-01-15T10:30:00',
      user: 'John Doe',
      action: 'created',
      entity: 'Purchase Requisition',
      description: 'Created purchase requisition PR-2026-001',
    },
    {
      id: '2',
      timestamp: '2026-01-15T11:00:00',
      user: 'Manager Smith',
      action: 'approved',
      entity: 'Purchase Requisition',
      description: 'Approved purchase requisition PR-2026-001',
    },
    {
      id: '3',
      timestamp: '2026-01-15T14:20:00',
      user: 'John Doe',
      action: 'updated',
      entity: 'Purchase Order',
      description: 'Updated delivery date for PO-2026-001',
      oldValue: '2026-01-20',
      newValue: '2026-01-25',
    },
  ];

  return <AuditLogViewer logs={sampleLogs} />;
}
