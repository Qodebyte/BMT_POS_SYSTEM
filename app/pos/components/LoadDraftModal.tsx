'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw, Calendar, User } from "lucide-react";
import { Draft } from '@/app/utils/type';
import { toast } from 'sonner';

interface LoadDraftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadDraft: (draft: Draft) => void;
}

const getDraftsFromStorage = (): Draft[] => {
  try {
    return JSON.parse(localStorage.getItem('pos_drafts') || '[]');
  } catch {
    return [];
  }
};

export function LoadDraftModal({ open, onOpenChange, onLoadDraft }: LoadDraftModalProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);

useEffect(() => {
    if (open) {
      const loadedDrafts = getDraftsFromStorage();
      setDrafts(loadedDrafts);
    } else {
      setDrafts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

 
  useEffect(() => {
    const handleStorageChange = () => {
    
      if (open) {
        setDrafts(getDraftsFromStorage());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [open]); 

  const handleDeleteDraft = useCallback((draftId: string) => {
    setDrafts((prevDrafts) => {
      const updated = prevDrafts.filter((d) => d.id !== draftId);
      localStorage.setItem('pos_drafts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>Saved Drafts</DialogTitle>
          <DialogDescription>
            Load previously saved orders from drafts
          </DialogDescription>
        </DialogHeader>

        {drafts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>No saved drafts</p>
            <p className="text-sm mt-1">Save orders as drafts from the POS</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drafts.map((draft) => (
                  <TableRow key={draft.id}>
                    <TableCell className="font-medium">
                      {formatDate(draft.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {draft.customer.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {draft.items.length} items
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      NGN {draft.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!draft.items || draft.items.length === 0) {
                              toast.error('This draft is empty or invalid');
                              return;
                            }

                            onLoadDraft(draft);
                            handleDeleteDraft(draft.id);
                            onOpenChange(false);
                          }}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteDraft(draft.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}