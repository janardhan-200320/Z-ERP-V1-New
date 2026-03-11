import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Save, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export default function LeadNotes() {
  const { toast } = useToast();
  const [noteContent, setNoteContent] = useState("");
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      content: "Initial contact made via email. Client expressed interest in enterprise plan. Follow up scheduled for next week.",
      createdBy: "John Smith",
      createdAt: "Feb 15, 2026 at 2:30 PM"
    },
    {
      id: "2",
      content: "Had a productive call discussing their current pain points. They need a solution that can scale with their growing team.",
      createdBy: "Emily Davis",
      createdAt: "Feb 14, 2026 at 10:15 AM"
    },
    {
      id: "3",
      content: "Sent proposal document with pricing details. Waiting for their feedback by end of week.",
      createdBy: "John Smith",
      createdAt: "Feb 13, 2026 at 4:45 PM"
    }
  ]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSaveNote = () => {
    if (!noteContent.trim()) {
      toast({
        title: "Empty Note",
        description: "Please enter some content before saving.",
        variant: "destructive",
      });
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      content: noteContent.trim(),
      createdBy: "Current User",
      createdAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };

    setNotes([newNote, ...notes]);
    setNoteContent("");
    
    toast({
      title: "Note Saved",
      description: "Your note has been added successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notes</h1>
              <p className="text-sm text-gray-600">Manage lead notes and conversations</p>
            </div>
          </div>
        </div>

        {/* Add New Note Section */}
        <Card className="border-2 border-blue-200 shadow-md mb-6">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2 text-blue-900">
              <MessageSquare className="w-5 h-5" />
              Add New Note
            </CardTitle>
            <CardDescription>Write important information about your leads</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Type your note here... (e.g., Client showed interest in premium features, follow up next Monday)"
                rows={5}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="text-sm sm:text-base focus:ring-2 focus:ring-blue-400 resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {noteContent.length} characters
                </span>
                <Button
                  onClick={handleSaveNote}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              All Notes ({notes.length})
            </h2>
          </div>

          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <Card
                  key={note.id}
                  className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <CardContent className="p-4">
                    <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <Avatar className="w-6 h-6 ring-1 ring-gray-200">
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-semibold">
                          {getInitials(note.createdBy)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{note.createdBy}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {note.createdAt}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="py-12">
                <div className="text-center text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-sm sm:text-base font-medium">No notes yet</p>
                  <p className="text-xs mt-1">Add your first note using the form above</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
