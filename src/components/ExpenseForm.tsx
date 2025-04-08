
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Member, ExpenseCategory } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface ExpenseFormProps {
  members: Member[];
  onAddExpense: (expense: {
    description: string;
    amount: number;
    paidBy: string;
    date: string;
    category: ExpenseCategory;
    participants: string[];
  }) => void;
}

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'food', label: '🍔 Food & Drinks' },
  { value: 'accommodation', label: '🏠 Accommodation' },
  { value: 'transportation', label: '🚗 Transportation' },
  { value: 'activities', label: '🎯 Activities' },
  { value: 'other', label: '📦 Other' },
];

const ExpenseForm = ({ members, onAddExpense }: ExpenseFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [participants, setParticipants] = useState<string[]>([]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setPaidBy('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setCategory('food');
    setParticipants([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !paidBy || participants.length === 0) {
      return;
    }

    onAddExpense({
      description,
      amount: parseFloat(amount),
      paidBy,
      date,
      category,
      participants,
    });

    resetForm();
  };

  const handleSelectAllParticipants = () => {
    if (participants.length === members.length) {
      setParticipants([]);
    } else {
      setParticipants(members.map(member => member.id));
    }
  };

  const toggleParticipant = (memberId: string) => {
    if (participants.includes(memberId)) {
      setParticipants(participants.filter(id => id !== memberId));
    } else {
      setParticipants([...participants, memberId]);
    }
  };

  // Default to splitting among all when a new expense is being created
  if (members.length > 0 && participants.length === 0 && paidBy === '') {
    setParticipants(members.map(member => member.id));
  }

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-center">Add Expense</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="What was it for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="How much?"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="paidBy">Paid by</Label>
          <Select 
            value={paidBy} 
            onValueChange={setPaidBy}
          >
            <SelectTrigger id="paidBy">
              <SelectValue placeholder="Who paid?" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            value={category} 
            onValueChange={(value) => setCategory(value as ExpenseCategory)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Split With</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAllParticipants}
            >
              {participants.length === members.length ? 'Unselect All' : 'Select All'}
            </Button>
          </div>
          
          <div className="border rounded-md p-2 space-y-2 max-h-40 overflow-y-auto">
            {members.length === 0 ? (
              <div className="text-center text-muted-foreground py-2">
                Add members first
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`participant-${member.id}`}
                    checked={participants.includes(member.id)}
                    onCheckedChange={() => toggleParticipant(member.id)}
                  />
                  <Label htmlFor={`participant-${member.id}`}>{member.name}</Label>
                </div>
              ))
            )}
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!description || !amount || !paidBy || participants.length === 0}
        >
          Add Expense
        </Button>
      </form>
    </Card>
  );
};

export default ExpenseForm;
