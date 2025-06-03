
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { VisibilityToggle } from './VisibilityToggle';

/**
 * Contact Information Step
 * 
 * Updated to emphasize that this is for neighbor-to-neighbor contact sharing
 * Rather than complex scheduling, neighbors will use their preferred methods to coordinate
 */
interface ContactInfoStepProps {
  form: UseFormReturn<any>;
  emailVisible: boolean;
  phoneVisible: boolean;
  addressVisible: boolean;
  visibilityError: string;
  showOptions: boolean;
  onEmailVisibleChange: (value: boolean) => void;
  onPhoneVisibleChange: (value: boolean) => void;
  onAddressVisibleChange: (value: boolean) => void;
  onToggleOptions: (show: boolean) => void;
  onVisibilityChange: () => void;
}

export const ContactInfoStep: React.FC<ContactInfoStepProps> = ({
  form,
  emailVisible,
  phoneVisible,
  addressVisible,
  visibilityError,
  showOptions,
  onEmailVisibleChange,
  onPhoneVisibleChange,
  onAddressVisibleChange,
  onToggleOptions,
  onVisibilityChange
}) => {
  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Contact Information</h2>
        <p className="text-sm text-muted-foreground">
          When neighbors are interested in your skills or items, they'll see your preferred contact methods. 
          You can coordinate directly using your favorite communication style.
        </p>
      </div>

      {/* Phone Number */}
      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number (Optional)</FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Address */}
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="123 Main St, City, State 12345"
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Contact Visibility Preferences */}
      <VisibilityToggle
        emailVisible={emailVisible}
        phoneVisible={phoneVisible}
        addressVisible={addressVisible}
        visibilityError={visibilityError}
        showOptions={showOptions}
        onEmailVisibleChange={onEmailVisibleChange}
        onPhoneVisibleChange={onPhoneVisibleChange}
        onAddressVisibleChange={onAddressVisibleChange}
        onToggleOptions={onToggleOptions}
        onVisibilityChange={onVisibilityChange}
      />

      {/* Helpful tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Your email is always available to neighbors when they express interest. 
          Add phone or address if you prefer those contact methods for coordinating meetups or deliveries.
        </p>
      </div>
    </div>
  );
};
