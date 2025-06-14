import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
  DrawerDescription,
} from '@/components/ui/drawer';
import { AddExpenseForm } from './AddExpenseForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { Plus } from 'lucide-react';

export const QuickAddExpense = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleExpenseAdded = () => {
    // Data will be re-fetched by the pages if needed.
    // We can close the dialog/drawer here.
    setIsOpen(false);
  };

  const close = () => setIsOpen(false);

  const trigger = (
    <Button
      aria-label="Quick add expense"
      className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95
                 md:relative md:h-10 md:w-auto md:rounded-md md:px-4 md:shadow-none md:bg-transparent md:text-foreground md:hover:bg-accent"
    >
      <Plus className="h-6 w-6 md:mr-2" />
      <span className="hidden md:inline">Expense</span>
    </Button>
  );

  const content = (
    <div className="p-4 md:p-0">
        <AddExpenseForm onExpenseAdded={handleExpenseAdded} closeDialog={close} />
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          {trigger}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Add New Expense</DrawerTitle>
            <DrawerDescription>
              Quickly add a new expense to one of your trips.
            </DrawerDescription>
          </DrawerHeader>
          {content}
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};