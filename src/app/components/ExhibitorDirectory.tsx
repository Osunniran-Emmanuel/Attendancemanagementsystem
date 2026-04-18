import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
import { AttendeeRecord } from '../types';
import { Search, Filter, Store, MapPin, Tag } from 'lucide-react';

export function ExhibitorDirectory() {
  const [exhibitors, setExhibitors] = useState<AttendeeRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const loadData = () => {
      const allSessions = attendanceService.getSessions();
      const allExhibitors = allSessions.flatMap(s => 
        s.attendees.filter(a => a.role === 'exhibitor')
      );
      setExhibitors(allExhibitors);
    };

    loadData();
    return attendanceService.subscribe(loadData);
  }, []);


  const categories = ['All', ...Array.from(new Set(exhibitors.map(e => e.category).filter(Boolean))) as string[]];

  const filteredExhibitors = exhibitors.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.boothNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Exhibitor Directory</h1>
          <p className="text-muted-foreground">Find exhibitors and their locations at the event</p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or booth..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 overflow-x-auto whitespace-nowrap">
            <Filter className="w-5 h-5 text-muted-foreground shrink-0" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredExhibitors.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border border-dashed rounded-xl">
              <Store className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No exhibitors found matching your criteria.</p>
            </div>
          ) : (
            filteredExhibitors.map((exhibitor) => (
              <div 
                key={exhibitor.id}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{exhibitor.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <Tag className="w-3.5 h-3.5" />
                      {exhibitor.category}
                    </div>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span className="font-bold">{exhibitor.boothNumber}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Store className="w-4 h-4" />
                    <span>Official Presence</span>
                  </div>
                  <span>ID: {exhibitor.idNumber}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
