import { Checkbox } from "$lib/components/ui/checkbox";
import { renderComponent, renderSnippet } from "$lib/components/ui/data-table/index";
import type { ColumnDef } from "@tanstack/table-core";
import { createRawSnippet } from "svelte";
import DataTableButton from "./data-table-button.svelte";
import { format } from "date-fns";
import type { GetProductionOrdersResult } from "$lib/server/routes/production";
import DataTableActions from "./data-table-actions.svelte";


export const columns: ColumnDef<GetProductionOrdersResult[0]>[] = [
  {
    id: "select",
    header: ({ table }) =>
      renderComponent(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate:
          table.getIsSomePageRowsSelected() &&
          !table.getIsAllPageRowsSelected(),
        onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
        "aria-label": "Select all",
      }),
    cell: ({ row }) =>
      renderComponent(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value) => row.toggleSelected(!!value),
        "aria-label": "Select row",
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "productionId",
    header: "Production ID"
  },
  {
    accessorKey: "orderDate",
    header: () => {
      const amountHeaderSnippet = createRawSnippet(() => ({
        render: () => `<div class="text-right">Order Date</div>`,
      }));
      return renderSnippet(amountHeaderSnippet, "");
    },
    cell: ({ row }) => {


      const amountCellSnippet = createRawSnippet<[string]>((getDate) => {
        const date = getDate();
        if (typeof date !== 'string') {
          return {
            render: () => `<div class="text-right font-medium"></div>`,
          };
        }
        return {
          render: () => `<div class="text-right font-medium">${date}</div>`,
        };
      });

      return renderSnippet(
        amountCellSnippet,
        format(new Date(row.getValue("orderDate")), 'dd/MM/yyyy')
      );
    },
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Customer",
      onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    }),
  },
  {
    accessorKey: "productName",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Product",
      onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    }),
  },
  {
    accessorKey: "stitches",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Stitches",
      onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    }),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => renderComponent(DataTableButton, {
      name: "Quantity",
      onclick: () => column.toggleSorting(column.getIsSorted() === "asc"),
    }),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      // You can pass whatever you need from `row.original` to the component
      return renderComponent(DataTableActions, { id: row.original.productionId.toString() });
    },
  },
];