import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Member, ExpenseCategory, Expense } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

interface EditExpenseDialogProps {
  expense: Expense | null;
  members: Member[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateExpense: (expense: Expense) => void;
}

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'food', label: '🍔 Food & Drinks' },
  { value: 'accommodation', label: '🏠 Accommodation' },
  { value: 'transportation', label: '🚗 Transportation' },
  { value: 'activities', label: '🎯 Activities' },
  { value: 'other', label: '📦 Other' },
];

const EditExpenseDialog = ({ expense, members, isOpen, onClose, onUpdateExpense }: EditExpenseDialogProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [participants, setParticipants] = useState<string[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'uneven'>('equal');
  const [shares, setShares] = useState<{ [participantId: string]: number }>({});
  const [splitTab, setSplitTab] = useState<'participants' | 'amounts'>('participants');

  // Initialize form with expense data
  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setPaidBy(expense.paidBy);
      setDate(format(new Date(expense.date), 'yyyy-MM-dd'));
      setCategory(expense.category as ExpenseCategory);
      setParticipants(expense.participants);
      setSplitType(expense.splitType as 'equal' | 'uneven');
      setShares(expense.shares || {});
      setSplitTab('participants');
    }
  }, [expense]);

  // Initialize shares when participants change
  useEffect(() => {
    if (splitType === 'equal' || participants.length === 0) return;
    
    const newShares = { ...shares };
    
    // Add missing participants
    participants.forEach(participantId => {
      if (!newShares[participantId]) {
        newShares[participantId] = 0;
      }
    });
    
    // Remove participants who are no longer included
    Object.keys(newShares).forEach(participantId => {
      if (!participants.includes(participantId)) {
        delete newShares[participantId];
      }
    });
    
    setShares(newShares);
  }, [participants]);

  // Update share values when amount changes
  useEffect(() => {
    if (splitType !== 'uneven' || participants.length === 0 || !amount) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return;
    
    // Calculate equal shares as a starting point
    const equalShare = parsedAmount / participants.length;
    
    // Create a new shares object with equal distribution
    const newShares = { ...shares };
    participants.forEach(participantId => {
      // Only reset if the value is 0 or doesn't exist
      if (!newShares[participantId]) {
        newShares[participantId] = equalShare;
      }
    });
    
    setShares(newShares);
  }, [amount, participants, splitType]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense || !description || !amount || !paidBy || participants.length === 0) {
      return;
    }

    // Check if shares add up to the total amount
    if (splitType === 'uneven') {
      const totalShares = Object.values(shares).reduce((sum, share) => sum + share, 0);
      const parsedAmount = parseFloat(amount);
      
      // Allow a small rounding error (0.01)
      if (Math.abs(totalShares - parsedAmount) > 0.01) {
        alert(`The sum of individual shares (${totalShares.toFixed(2)}) doesn't match the total amount (${parsedAmount.toFixed(2)}).`);
        return;
      }
    }

    const updatedExpense: Expense = {
      ...expense,
      description,
      amount: parseFloat(amount),
      paidBy,
      date,
      category,
      participants,
      splitType,
      shares: splitType === 'uneven' ? shares : undefined,
    };

    onUpdateExpense(updatedExpense);
    onClose();
  };

  // Handle share input change
  const handleShareChange = (participantId: string, value: string) => {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) return;
    
    setShares(prev => ({
      ...prev,
      [participantId]: parsedValue
    }));
  };

  // Calculate remaining amount for the last participant
  const calculateRemaining = () => {
    if (!amount || participants.length === 0) return 0;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return 0;
    
    const currentTotal = Object.values(shares).reduce((sum, share) => sum + share, 0);
    return parsedAmount - currentTotal;
  };

  // Handle select all participants
  const handleSelectAllParticipants = () => {
    if (participants.length === members.length) {
      setParticipants([]);
    } else {
      setParticipants(members.map(member => member.id));
    }
  };

  // Toggle participant selection
  const toggleParticipant = (memberId: string) => {
    if (participants.includes(memberId)) {
      setParticipants(participants.filter(id => id !== memberId));
    } else {
      setParticipants([...participants, memberId]);
    }
  };

  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              placeholder="What was it for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="edit-amount">Amount</Label>
            <Input
              id="edit-amount"
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
            <Label htmlFor="edit-paidBy">Paid by</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger id="edit-paidBy">
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
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="edit-category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ExpenseCategory)}>
              <SelectTrigger id="edit-category">
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
          
          <div className="space-y-2">
            <Label>Split Type</Label>
            <RadioGroup 
              value={splitType} 
              onValueChange={(value) => setSplitType(value as 'equal' | 'uneven')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="equal" id="edit-split-equal" />
                <Label htmlFor="edit-split-equal">Equal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="uneven" id="edit-split-uneven" />
                <Label htmlFor="edit-split-uneven">Uneven</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            {splitType === 'equal' ? (
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
                
                <div className="border rounded-md p-2 space-y-2 max-h-32 overflow-y-auto">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-participant-${member.id}`}
                        checked={participants.includes(member.id)}
                        onCheckedChange={() => toggleParticipant(member.id)}
                      />
                      <Label htmlFor={`edit-participant-${member.id}`}>{member.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Tabs value={splitTab} onValueChange={(v) => setSplitTab(v as 'participants' | 'amounts')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="participants">Select Participants</TabsTrigger>
                    <TabsTrigger value="amounts" disabled={participants.length === 0}>Set Amounts</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="participants">
                    <div className="flex justify-between items-center mb-2">
                      <Label>Select Participants</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSelectAllParticipants}
                      >
                        {participants.length === members.length ? 'Unselect All' : 'Select All'}
                      </Button>
                    </div>
                    
                    <div className="border rounded-md p-2 space-y-2 max-h-32 overflow-y-auto">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-participant-uneven-${member.id}`}
                            checked={participants.includes(member.id)}
                            onCheckedChange={() => toggleParticipant(member.id)}
                          />
                          <Label htmlFor={`edit-participant-uneven-${member.id}`}>{member.name}</Label>
                        </div>
                      ))}
                    </div>
                    
                    {participants.length > 0 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full mt-2" 
                        onClick={() => setSplitTab('amounts')}
                      >
                        Next: Set Amounts
                      </Button>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="amounts">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label>Assign Individual Amounts</Label>
                        <span className="text-sm">
                          Total: ${parseFloat(amount || '0').toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="border rounded-md p-2 space-y-3 max-h-40 overflow-y-auto">
                        {participants.map((participantId) => {
                          const member = members.find(m => m.id === participantId);
                          if (!member) return null;
                          
                          return (
                            <div key={member.id} className="grid grid-cols-3 gap-2 items-center">
                              <Label htmlFor={`edit-share-${member.id}`} className="col-span-1">
                                {member.name}
                              </Label>
                              <Input
                                id={`edit-share-${member.id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={shares[member.id]?.toFixed(2) || '0.00'}
                                onChange={(e) => handleShareChange(member.id, e.target.value)}
                                className="col-span-2"
                              />
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm p-2 rounded-md bg-muted">
                        <span>Remaining:</span>
                        <span className={`font-bold ${Math.abs(calculateRemaining()) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                          ${calculateRemaining().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                !description || 
                !amount || 
                !paidBy || 
                participants.length === 0 || 
                (splitType === 'uneven' && Math.abs(calculateRemaining()) > 0.01)
              }
            >
              Update Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseDialog;