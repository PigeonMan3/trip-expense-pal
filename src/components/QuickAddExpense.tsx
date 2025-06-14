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

interface QuickAddExpenseProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactNode | null;
}

export const QuickAddExpense = ({ isOpen: controlledOpen, onOpenChange, triggerButton }: QuickAddExpenseProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isMobile = useIsMobile();

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleExpenseAdded = () => {
    // Data will be re-fetched by the pages if needed.
    // We can close the dialog/drawer here.
    setIsOpen(false);
  };

  const close = () => setIsOpen(false);

  const defaultTrigger = (
    <Button
      aria-label="Quick add expense"
      className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 md:hidden"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );

  // Use provided trigger button or default one, unless explicitly set to null
  const trigger = triggerButton === null ? null : (triggerButton || defaultTrigger);

  const content = (
    <div className="p-4 md:p-0">
        <AddExpenseForm onExpenseAdded={handleExpenseAdded} closeDialog={close} />
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
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
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};