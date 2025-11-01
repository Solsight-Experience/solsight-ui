import { useFilterStore } from '@/stores/filter.stores';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';

const metrics = [
  { key: 'tokenAge', label: 'Token Age', unit: 'minutes' },
  { key: 'liquidity', label: 'Liquidity', unit: '$' },
  { key: 'marketCap', label: 'Market Cap', unit: '$' },
  { key: 'volume', label: 'Volume', unit: '$' },
  { key: 'txns', label: 'Txns', unit: null },
  { key: 'buys', label: 'Buys', unit: null },
  { key: 'sells', label: 'Sells', unit: null },
];

export const MetricsTab = () => {
  const { filters, setFilter } = useFilterStore();

  const handleChange = (key: string, type: 'min' | 'max', value: string) => {
    const current = (filters[key] as [string, string]) || {};
    const newValue: [string, string] = [
      type === 'min' ? value : current[0] || '',
      type === 'max' ? value : current[1] || '',
    ];
    setFilter(key, newValue);
  };

  return (
    <div className="flex flex-col gap-4">
      {metrics.map((item) => {
        const [min = '', max = ''] = (filters[item.key] as [string, string]) || [];

        return (
          <div key={item.key} className="grid grid-cols-[3fr_4fr_0.5fr_4fr] items-center gap-2">
            <Label className="text-sm font-medium">{item.label}</Label>

            <InputGroup>
              <InputGroupInput
                value={min}
                onChange={(e) => handleChange(item.key, 'min', e.target.value)}
              />
              {item.unit && (
                <InputGroupAddon align="inline-end">
                  <InputGroupText>{item.unit}</InputGroupText>
                </InputGroupAddon>
              )}
            </InputGroup>

            <div className="text-default-dark text-lg flex justify-center items-center">~</div>

            <InputGroup>
              <InputGroupInput
                value={max}
                onChange={(e) => handleChange(item.key, 'max', e.target.value)}
              />
              {item.unit && (
                <InputGroupAddon align="inline-end">
                  <InputGroupText>{item.unit}</InputGroupText>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        );
      })}
    </div>
  );
};
