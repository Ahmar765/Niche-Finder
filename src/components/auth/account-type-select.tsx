'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SIGNUP_ACCOUNT_OPTIONS, type BootstrapAccountId } from '@/config/bootstrap-accounts';

type AccountTypeSelectProps = {
  value: BootstrapAccountId;
  onChange: (value: BootstrapAccountId) => void;
};

export function AccountTypeSelect({ value, onChange }: AccountTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="account-type">Account Type</Label>
      <Select value={value} onValueChange={(next) => onChange(next as BootstrapAccountId)}>
        <SelectTrigger id="account-type">
          <SelectValue placeholder="Select account type" />
        </SelectTrigger>
        <SelectContent>
          {SIGNUP_ACCOUNT_OPTIONS.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.label} — {account.description}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
