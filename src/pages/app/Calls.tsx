import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CallList } from '@/components/calls/CallList';
import { SipgatePanel } from '@/components/calls/SipgatePanel';
import { useCalls } from '@/hooks/useCalls';
import { useAuth } from '@/contexts/AuthContext';
import { Call, CallStatus, CALL_STATUS_LABELS } from '@/types/calls';
import { Phone, Search, Filter } from 'lucide-react';

export default function Calls() {
  const navigate = useNavigate();
  const { hasMinRole } = useAuth();
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { calls, loading, startCall, endCall } = useCalls(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );

  const showSipgate = hasMinRole('mitarbeiter');

  // Filter calls by search query
  const filteredCalls = calls.filter(call => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      call.lead?.first_name?.toLowerCase().includes(query) ||
      call.lead?.last_name?.toLowerCase().includes(query) ||
      call.lead?.company?.toLowerCase().includes(query) ||
      call.lead?.email?.toLowerCase().includes(query)
    );
  });

  const handleViewCall = (call: Call) => {
    navigate(`/app/calls/${call.id}`);
  };

  const handleStartCall = async (callId: string) => {
    await startCall(callId);
  };

  const handleEndCall = async (callId: string) => {
    await endCall(callId);
  };

  // Stats
  const scheduledCount = calls.filter(c => c.status === 'scheduled').length;
  const analyzedCount = calls.filter(c => c.status === 'analyzed').length;
  const todayCount = calls.filter(c => {
    if (!c.scheduled_at) return false;
    const today = new Date();
    const callDate = new Date(c.scheduled_at);
    return callDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calls</h1>
          <p className="text-muted-foreground">
            Alle Verkaufsgespräche und Analysen
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Heute geplant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ausstehend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Analysiert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyzedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Lead, Firma..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select 
              value={statusFilter} 
              onValueChange={(v) => setStatusFilter(v as CallStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                {Object.entries(CALL_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Call List */}
      <CallList
        calls={filteredCalls}
        loading={loading}
        onViewCall={handleViewCall}
        onStartCall={handleStartCall}
        onEndCall={handleEndCall}
        emptyMessage="Keine Calls gefunden"
      />
    </div>
  );
}
