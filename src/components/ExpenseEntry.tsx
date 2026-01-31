import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ExpenseEntryProps {
  onExpenseAdded: (expense: any) => void;
}

const phases = [
  'Foundation Complete',
  'Framing Done', 
  'Roofing Finished',
  'Electrical/Plumbing',
  'Interior Finishing'
];

const categories = [
  'Materials',
  'Labor',
  'Equipment Rental',
  'Permits',
  'Professional Services',
  'Other'
];

export default function ExpenseEntry({ onExpenseAdded }: ExpenseEntryProps) {
  const [open, setOpen] = useState(false);
  const [expense, setExpense] = useState({
    phase: '',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let receiptUrl = '';
      
      if (receipt) {
        const fileName = `${Date.now()}-${receipt.name}`;
        const { data, error } = await supabase.storage
          .from('construction-receipts')
          .upload(fileName, receipt);
        
        if (error) throw error;
        receiptUrl = data.path;
      }
      
      const newExpense = {
        id: Date.now(),
        ...expense,
        amount: parseFloat(expense.amount),
        receiptUrl
      };
      
      onExpenseAdded(newExpense);
      setOpen(false);
      setExpense({
        phase: '',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setReceipt(null);
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" />Add Expense</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Construction Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Phase</Label>
            <Select value={expense.phase} onValueChange={(value) => setExpense({...expense, phase: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                {phases.map(phase => (
                  <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={expense.category} onValueChange={(value) => setExpense({...expense, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Amount ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={expense.amount}
              onChange={(e) => setExpense({...expense, amount: e.target.value})}
              required
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={expense.date}
              onChange={(e) => setExpense({...expense, date: e.target.value})}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={expense.description}
              onChange={(e) => setExpense({...expense, description: e.target.value})}
              placeholder="Brief description of expense"
            />
          </div>
          <div>
            <Label>Receipt</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Upload className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <Button type="submit" disabled={!expense.phase || !expense.category || !expense.amount || uploading} className="w-full">
            {uploading ? 'Adding...' : 'Add Expense'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}