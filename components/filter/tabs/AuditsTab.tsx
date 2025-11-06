import { useFilterStore } from '@/stores/filter.stores';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const audits = [
  { key: 'minAuthDisable', label: 'Mint Auth Disable' },
  { key: 'freezableDisable', label: 'Freezable Disable' },
  { key: 'atLeastOneSocial', label: 'At Least 1 Social' },
  { key: 'burnt', label: 'Burnt' },
];

export const AuditsTab = () => {
  const { filters, setFilter } = useFilterStore();

  const handleChange = (key: string, value: boolean) => {
    setFilter(key, value);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {audits.map((item) => {
        const val = (filters[item.key] as boolean) || false;

        return (
          <div key={item.key}>
            <div className="flex gap-2">
              <Checkbox
                id={item.key}
                checked={val}
                onCheckedChange={(e) => handleChange(item.key, e === 'indeterminate' ? false : e)}
              />
              <Label htmlFor={item.key}>{item.label}</Label>
            </div>
          </div>
        );
      })}
      <div className="w-full h-15"></div>
    </div>
  );
};
