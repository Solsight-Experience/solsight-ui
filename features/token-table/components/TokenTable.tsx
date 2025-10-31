import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, useReactTable } from "@tanstack/react-table"
//
// Defines the possible categories a token can belong to
export type TokenCategory = "MEME" | "GameFi" | "Infrastructure" | "AI" | "DeFi";

type TokenTableData = {
  id: string
  token: {
    iconUrl: string;
    /** The ticker symbol (e.g. "MORON") */
    ticker: string;
    name: string;
    priceHistory: number[];
    category: TokenCategory;
    age: string;
  }
  marketCap: {
    value: number
    currencyCode: string;
    currencySymbol: string;
    changePercent24h: number;
  }
  liquidity: number
  volume24h: number
  transactions: {
    buyCount: number;
    sellCount: number;
    buyVolumn: number;
    sellVolumn: number;
  }
}

const data: TokenTableData[] = [
  // 1. MORON
  {
    id: "moron_contract_address_xyz",
    token: {
      iconUrl: "/icons/moron.png",
      ticker: "MORON",
      name: "MORON",
      priceHistory: [30, 45, 40, 50, 60, 55, 65], // Upward trend
      category: "MEME",
      age: "10m",
    },
    marketCap: {
      value: 123000,
      currencyCode: "USD",
      currencySymbol: "$",
      changePercent24h: 46.8,
    },
    liquidity: 38000,
    volume24h: 20400,
    transactions: {
      buyCount: 2860,
      sellCount: 2010,
      buyVolumn: 27000,
      sellVolumn: 12000,
    },
  },
  // 2. RENDER
  {
    id: "render_contract_address_abc",
    token: {
      iconUrl: "/icons/render.png",
      ticker: "RENDER",
      name: "RENDER",
      priceHistory: [80, 75, 70, 65, 60, 55, 50], // Downward trend
      category: "GameFi",
      age: "7d",
    },
    marketCap: {
      value: 2030000000, // 2.03B
      currencyCode: "USD",
      currencySymbol: "$",
      changePercent24h: -26.5,
    },
    liquidity: 115000000, // 115M
    volume24h: 980000000, // 980M
    transactions: {
      buyCount: 123000,
      sellCount: 120000,
      buyVolumn: 83000,
      sellVolumn: 46000,
    },
  },
  // 3. UOG
  {
    id: "uog_contract_address_123",
    token: {
      iconUrl: "/icons/uog.png",
      ticker: "UOG",
      name: "University Of Games",
      priceHistory: [50, 52, 51, 53, 52, 54, 53], // Neutral / Slight Up
      category: "GameFi",
      age: "2mo 4d",
    },
    marketCap: {
      value: 530800,
      currencyCode: "USD",
      currencySymbol: "$",
      changePercent24h: 0.0,
    },
    liquidity: 82260,
    volume24h: 68740,
    transactions: {
      buyCount: 482000,
      sellCount: 480000,
      buyVolumn: 278000,
      sellVolumn: 204000,
    },
  },
  // 4. 2Z
  {
    id: "2z_contract_address_456",
    token: {
      iconUrl: "/icons/2z.png",
      ticker: "2Z",
      name: "DoubleZero",
      priceHistory: [70, 65, 75, 60, 68, 55, 60], // Volatile / Down
      category: "Infrastructure",
      age: "10d",
    },
    marketCap: {
      value: 865190000, // 865.19M
      currencyCode: "USD",
      currencySymbol: "$",
      changePercent24h: -10.1,
    },
    liquidity: 72580000, // 72.58M
    volume24h: 12400000, // 12.4M
    transactions: {
      buyCount: 12400,
      sellCount: 12000,
      buyVolumn: 6800,
      sellVolumn: 5600,
    },
  },
  // 5. SOON
  {
    id: "soon_contract_address_789",
    token: {
      iconUrl: "/icons/soon.png",
      ticker: "SOON",
      name: "SOON",
      priceHistory: [20, 25, 23, 30, 28, 35, 38], // Upward trend
      category: "Infrastructure",
      age: "10m",
    },
    marketCap: {
      value: 234800000, // 234.8M
      currencyCode: "USD",
      currencySymbol: "$",
      changePercent24h: 3.4,
    },
    liquidity: 120800000, // 120.8M
    volume24h: 118600000, // 118.6M
    transactions: {
      buyCount: 123000,
      sellCount: 120000,
      buyVolumn: 1500,
      sellVolumn: 2500,
    },
  },
  // 6. DOGE
  {
    id: "doge_contract_address_dog",
    token: {
      iconUrl: "/icons/doge.png",
      ticker: "DOGE",
      name: "Dogecoin",
      priceHistory: [40, 38, 42, 35, 37, 30, 32], // Downward trend
      category: "MEME",
      age: "10y",
    },
    marketCap: {
      value: 28500000000, // 28.5B
      currencyCode: "USD",
      currencySymbol: "$",
      changePercent24h: -2.0,
    },
    liquidity: 3700000000, // 3.7B
    volume24h: 28500000, // 28.5M
    transactions: {
      buyCount: 331000,
      sellCount: 330000,
      buyVolumn: 130000,
      sellVolumn: 200000,
    },
  },
  // 7. FET
  {
    id: "fet_contract_address_ai",
    token: {
      iconUrl: "/icons/fet.png",
      ticker: "FET",
      name: "Artificial Superintelligence",
      priceHistory: [30, 45, 40, 50, 60, 55, 65], // Upward trend
      category: "AI",
      age: "10m",
    },
    marketCap: {
      value: 963300000, // 963.3M
      currencyCode: "USD",
      currencySymbol: "$",
      changePercent24h: 46.8,
    },
    liquidity: 300100000, // 300.1M
    volume24h: 143700000, // 143.7M
    transactions: {
      buyCount: 123000, // Same as SOON in UI
      sellCount: 120000, // Same as SOON in UI
      buyVolumn: 1500, // Same as SOON in UI
      sellVolumn: 2500, // Same as SOON in UI
    },
  },]

const columns: ColumnDef<TokenTableData>[] = [{
  accessorKey: "token",
  header: "Token",
  cell: ({ row }) => (
    <div>{row.getValue("token")}</div>
  )
}]

export default function TokenTable() {
  const table = useReactTable({ data, columns })

  return <Table>
    <TableHeader>
      {table.getHeaderGroups().map(hg => (
        <TableRow key={hg.id}>
          {hg.headers.map(header => <TableHead key={header.id}>
            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
          </TableHead>)}
        </TableRow>
      ))}
    </TableHeader>
    <TableBody>
      {table.getRowModel().rows?.length ? (table.getRowModel().rows.map((row) => (
        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
          {row.getVisibleCells().map(cell => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))) : (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
}
