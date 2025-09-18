import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGroups } from "@/hooks/useGroups";

/**
 * Props for the EventFormGroupField component
 */
interface EventFormGroupFieldProps {
  selectedGroupId?: string;
  onGroupChange: (groupId: string | undefined) => void;
}

/**
 * Component that renders the group selection field for events
 * 
 * This component allows users to optionally associate an event with a group.
 * Only shows groups that the user is a member of.
 */
const EventFormGroupField = ({
  selectedGroupId,
  onGroupChange
}: EventFormGroupFieldProps) => {
  // Get user's groups using the existing hook
  const { data: userGroups, isLoading } = useGroups({ 
    includeCurrentUserMembership: true 
  });

  // Filter to only show groups where the user is a member
  const memberGroups = userGroups?.filter(group => 
    group.current_user_membership
  ) || [];

  return (
    <div className="space-y-2">
      <Label htmlFor="group">Group (Optional)</Label>
      <Select 
        value={selectedGroupId || "__none__"} 
        onValueChange={(value) => onGroupChange(value === "__none__" ? undefined : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a group (optional)" />
        </SelectTrigger>
        <SelectContent>
          {/* Use a special non-empty value for "No group" to avoid Radix UI validation errors */}
          <SelectItem value="__none__">No group</SelectItem>
          {isLoading ? (
            <SelectItem value="__loading__" disabled>Loading groups...</SelectItem>
          ) : (
            memberGroups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EventFormGroupField;