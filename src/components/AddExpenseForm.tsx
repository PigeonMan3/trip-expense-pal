import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Trip, Member, ExpenseCategory } from '@/types';
import { loadTrips, saveExpenseQuick, loadMembersForTrip } from '@/utils/supabaseStorage';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';

const expenseSchema = z.object({
  tripId: z.string({ required_error: 'Please select a trip.' }),
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0.'),
  date: z.date(),
  paidBy: z.string({ required_error: 'Please select who paid.' }),
  category: z.enum(['food', 'accommodation', 'transportation', 'activities', 'other'], {
    required_error: "You need to select an expense category.",
  }),
  participants: z.array(z.string()).min(1, 'At least one participant is required.'),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseFormProps {
  onExpenseAdded: () => void;
  closeDialog?: () => void;
}

export function AddExpenseForm({ onExpenseAdded, closeDialog }: AddExpenseFormProps) {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date(),
      participants: [],
    },
  });

  useEffect(() => {
    if (user) {
      loadTrips(user.id).then(setTrips);
    }
  }, [user]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'tripId' && value.tripId !== selectedTripId) {
        setSelectedTripId(value.tripId ?? null);
        if (value.tripId) {
          loadMembersForTrip(value.tripId).then((membersData) => {
            setMembers(membersData);
            form.reset({
              ...form.getValues(),
              tripId: value.tripId,
              paidBy: undefined,
              participants: [],
            });
          });
        } else {
          setMembers([]);
          form.reset({
            ...form.getValues(),
            tripId: undefined,
            paidBy: undefined,
            participants: [],
          });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, selectedTripId]);

  const onSubmit = async (values: ExpenseFormValues) => {
    if (!user) return;

    const expenseToSave = {
      description: values.description,
      amount: values.amount,
      paidBy: values.paidBy,
      date: values.date.toISOString(),
      category: values.category,
      participants: values.participants,
      tripId: values.tripId,
      isSettlement: false,
      splitType: 'equal' as 'equal',
    };

    const savedExpense = await saveExpenseQuick(expenseToSave, user.id);
    if (savedExpense) {
      toast.success('Expense added!', {
        description: `${savedExpense.description} was added.`,
      });
      onExpenseAdded();
      closeDialog?.();
    } else {
      toast.error('Error', {
        description: 'Could not add expense.',
      });
    }
  };
  
  const categories: ExpenseCategory[] = ['food', 'accommodation', 'transportation', 'activities', 'other'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tripId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trip</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trip" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedTripId && (
          <>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Dinner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="capitalize">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paidBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid by</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select who paid" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="participants"
              render={() => (
                <FormItem>
                  <FormLabel>Participants</FormLabel>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <FormField
                        key={member.id}
                        control={form.control}
                        name="participants"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={member.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(member.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value ?? []), member.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== member.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {member.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Add Expense</Button>
          </>
        )}
      </form>
    </Form>
  )
}