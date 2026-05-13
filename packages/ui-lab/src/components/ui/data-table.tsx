import * as React from 'react';

import { cn } from '../../lib/utils';
import { Badge } from './badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

export interface DataTableColumn<TItem> {
  key: string;
  header: React.ReactNode;
  cell: (item: TItem) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<TItem> extends React.HTMLAttributes<HTMLDivElement> {
  columns: DataTableColumn<TItem>[];
  data: TItem[];
  emptyMessage?: string;
  getRowKey: (item: TItem, index: number) => React.Key;
}

function DataTable<TItem>({
  className,
  columns,
  data,
  emptyMessage = 'No rows',
  getRowKey,
  ...props
}: DataTableProps<TItem>) {
  return (
    <div
      data-slot="data-table"
      className={cn('overflow-hidden rounded-md border border-border bg-background', className)}
      {...props}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <TableRow key={getRowKey(item, index)}>
                {columns.map(column => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function DataTableStatus({ children }: React.ComponentProps<typeof Badge>) {
  return (
    <Badge data-slot="data-table-status" variant="outline">
      {children}
    </Badge>
  );
}

export { DataTable, DataTableStatus };
