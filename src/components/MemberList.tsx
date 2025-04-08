
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Member } from '@/types';

interface MemberListProps {
  members: Member[];
  onAddMember: (name: string) => void;
  onRemoveMember: (id: string) => void;
}

const MemberList = ({ members, onAddMember, onRemoveMember }: MemberListProps) => {
  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      onAddMember(newMemberName.trim());
      setNewMemberName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMember();
    }
  };

  return (
    <Card className="p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-center">Trip Members</h2>
      
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Add new member..."
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow"
        />
        <Button onClick={handleAddMember} variant="default">Add</Button>
      </div>
      
      {members.length === 0 ? (
        <div className="text-center text-muted-foreground p-4">
          No members yet. Add someone to get started!
        </div>
      ) : (
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between p-2 bg-muted rounded-md animate-fade-in">
              <span className="font-medium">{member.name}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemoveMember(member.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                ✕
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default MemberList;
